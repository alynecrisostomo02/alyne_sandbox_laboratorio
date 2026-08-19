/**
 * SUITE DE TESTES AUTOMATIZADOS - LUX WORKER V5
 * Executa testes de unidade sem depender da API externa do Gemini.
 */

import {
  createInitialPreferences,
  updatePreferences,
  matchesHardCriteria,
  selectAlternatives,
  generateQuickReplies,
  buildWhatsAppMessage,
} from "../worker.js";

// Mini framework de asserções sem dependências externas
function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FALHA DE TESTE] ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`[FALHA DE TESTE] ${message} | Esperado: ${JSON.stringify(expected)} | Recebido: ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`[FALHA DE TESTE] ${message} | Esperado: ${JSON.stringify(expected)} | Recebido: ${JSON.stringify(actual)}`);
  }
}

let passedCount = 0;
function runTest(name, fn) {
  try {
    fn();
    console.log(`✓ TESTE APROVADO: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`✗ TESTE FALHOU: ${name}`);
    console.error(`  ${err.message}`);
    process.exitCode = 1;
  }
}

console.log("==================================================");
console.log(" INICIANDO TESTES DO LUX WORKER V5");
console.log("==================================================\n");

// Catálogo de Testes Fictício com casos de borda
const sampleCatalog = [
  {
    id: "prop-1",
    idRef: "REF-001",
    title: "Casa Tradicional Centro",
    purpose: "venda",
    type: "casa",
    price: 480000,
    bedrooms: 2,
    suites: 1,
    status: "Disponível",
    features: ["piscina", "garagem"],
  },
  {
    id: "prop-2",
    idRef: "REF-002",
    title: "Casa Sobrado Alto Padrão",
    purpose: "venda",
    type: "casa",
    price: 620000,
    bedrooms: 3,
    suites: 1,
    status: "Disponível",
    features: ["churrasqueira", "garagem"],
  },
  {
    id: "prop-3",
    idRef: "REF-003",
    title: "Apartamento Luxo",
    purpose: "venda",
    type: "apartamento",
    price: 450000,
    bedrooms: 3,
    suites: 1,
    status: "Disponível",
    features: ["piscina"],
  },
  {
    id: "prop-4",
    idRef: "REF-004",
    title: "Casa para Alugar",
    purpose: "locacao",
    type: "casa",
    price: 2500,
    bedrooms: 3,
    suites: 1,
    status: "Disponível",
  },
  {
    id: "prop-5",
    idRef: "REF-005",
    title: "Casa Preço Sob Consulta",
    purpose: "venda",
    type: "casa",
    price: null,
    priceOnRequest: true,
    bedrooms: 3,
    suites: 1,
    status: "Disponibilidade sob consulta",
  },
  {
    id: "prop-6",
    idRef: "REF-006",
    title: "Casa Indisponível Vendida",
    purpose: "venda",
    type: "casa",
    price: 490000,
    bedrooms: 3,
    suites: 1,
    status: "Indisponível",
    features: ["piscina"],
  },
  {
    id: "prop-7",
    idRef: "REF-029",
    title: "Casa Modelo Específico REF-029",
    purpose: "venda",
    type: "casa",
    price: 520000,
    bedrooms: 3,
    suites: 1,
    status: "Disponível",
    features: ["piscina", "churrasqueira"],
  },
  {
    id: "prop-8",
    idRef: "REF-008",
    title: "Casa Dormitórios Desconhecidos",
    purpose: "venda",
    type: "casa",
    price: 490000,
    bedrooms: null,
    suites: null,
    status: "Disponível",
  },
];

// TESTE A
runTest("A: Extrair critérios iniciais - Comprar casa 3 quartos até 500 mil", () => {
  const prefs = updatePreferences({}, "Quero comprar uma casa de 3 quartos até 500 mil.");
  assertEqual(prefs.purpose, "venda", "Purpose deve ser 'venda'");
  assertEqual(prefs.type, "casa", "Type deve ser 'casa'");
  assertEqual(prefs.minDormitories, 3, "minDormitories deve ser 3");
  assertEqual(prefs.maxPrice, 500000, "maxPrice deve ser 500000");
});

// TESTE B
runTest("B: Atualizar e substituir orçamento - Pode ser até 650 mil", () => {
  const initial = updatePreferences({}, "Quero comprar uma casa de 3 quartos até 500 mil.");
  const updated = updatePreferences(initial, "Pensando melhor pode ser até 650 mil.");
  assertEqual(updated.maxPrice, 650000, "maxPrice antigo (500000) deve ser substituído por 650000");
  assertEqual(updated.purpose, "venda", "Purpose deve ser mantido");
  assertEqual(updated.type, "casa", "Type deve ser mantido");
});

// TESTE C
runTest("C: Adicionar feature obrigatória - E quero piscina", () => {
  const step1 = updatePreferences({}, "Quero comprar uma casa até 650 mil.");
  const step2 = updatePreferences(step1, "E quero piscina.");
  assert(step2.requiredFeatures.includes("piscina"), "Piscina deve estar em requiredFeatures");
});

// TESTE D
runTest("D: Remover feature obrigatória - Na verdade não precisa de piscina", () => {
  const step1 = updatePreferences({}, "Quero comprar uma casa com piscina.");
  assert(step1.requiredFeatures.includes("piscina"), "Piscina deve estar em requiredFeatures inicialmente");
  const step2 = updatePreferences(step1, "Na verdade não precisa de piscina.");
  assert(!step2.requiredFeatures.includes("piscina"), "Piscina deve ser removida de requiredFeatures");
});

// TESTE E
runTest("E: Purpose e Type rígidos - Quero alugar uma casa (Venda/Apartamento banidos)", () => {
  const prefs = updatePreferences({}, "Quero alugar uma casa.");
  assertEqual(prefs.purpose, "locacao", "Purpose deve ser locacao");
  assertEqual(prefs.type, "casa", "Type deve ser casa");

  const exacts = sampleCatalog.filter((p) => matchesHardCriteria(p, prefs));
  assert(exacts.every((p) => p.purpose === "locacao" && p.type === "casa"), "Exact matches devem ter purpose locacao e type casa");

  const alts = selectAlternatives(sampleCatalog, prefs, exacts);
  assert(alts.every((a) => a.property.purpose === "locacao" && a.property.type === "casa"), "Alternatives NUNCA devem incluir venda, apartamentos ou terrenos");
});

// TESTE F
runTest("F: Referência Específica - Quero saber da REF-029", () => {
  const prefs = updatePreferences({}, "Quero saber da REF-029.");
  assertEqual(prefs.specificRef, "REF-029", "specificRef deve capturar 'REF-029'");
});

// TESTE G
runTest("G: Status Indisponível nunca é recomendado", () => {
  const prefs = updatePreferences({}, "Quero comprar uma casa até 500 mil com piscina.");
  const propIndisponivel = sampleCatalog.find((p) => p.idRef === "REF-006");
  
  assert(!matchesHardCriteria(propIndisponivel, prefs), "Indisponível nunca pode ser exactMatch");

  const exacts = sampleCatalog.filter((p) => matchesHardCriteria(p, prefs));
  const alts = selectAlternatives(sampleCatalog, prefs, exacts);
  assert(!alts.some((a) => a.property.idRef === "REF-006"), "Indisponível nunca pode ser alternative");
});

// TESTE H
runTest("H: Preço null / priceOnRequest com orçamento máximo nunca é exactMatch", () => {
  const prefs = updatePreferences({}, "Quero comprar uma casa até 500 mil.");
  const propPrecoNull = sampleCatalog.find((p) => p.idRef === "REF-005");
  
  assert(!matchesHardCriteria(propPrecoNull, prefs), "Preço null ou sob consulta NÃO pode ser exactMatch para orçamento máximo exato");
});

// TESTE I
runTest("I: Dormitórios desconhecidos (null) nunca é exactMatch quando solicitado", () => {
  const prefs = updatePreferences({}, "Quero comprar uma casa de 3 quartos.");
  const propDormNull = sampleCatalog.find((p) => p.idRef === "REF-008");
  
  assert(!matchesHardCriteria(propDormNull, prefs), "Dormitórios null NÃO pode ser exactMatch quando há mínimo solicitado");
});

// TESTE J
runTest("J: Feature desconhecida nunca é exactMatch quando obrigatória", () => {
  const prefs = updatePreferences({}, "Quero uma casa com energia solar.");
  const propSemFeature = sampleCatalog.find((p) => p.idRef === "REF-001");
  
  assert(!matchesHardCriteria(propSemFeature, prefs), "Feature não confirmada/ausente NÃO pode ser exactMatch");
});

// TESTE K
runTest("K: Purpose diferente nunca entra em alternatives", () => {
  const prefs = updatePreferences({}, "Quero alugar uma casa.");
  const exacts = sampleCatalog.filter((p) => matchesHardCriteria(p, prefs));
  const alts = selectAlternatives(sampleCatalog, prefs, exacts);
  
  assert(alts.every((a) => a.property.purpose === "locacao"), "Purpose diferente NUNCA é alternativa");
});

// TESTE L
runTest("L: Type diferente nunca entra em alternatives", () => {
  const prefs = updatePreferences({}, "Quero comprar uma casa.");
  const exacts = sampleCatalog.filter((p) => matchesHardCriteria(p, prefs));
  const alts = selectAlternatives(sampleCatalog, prefs, exacts);
  
  assert(alts.every((a) => a.property.type === "casa"), "Type diferente NUNCA é alternativa quando explicitado");
});

console.log("\n--------------------------------------------------");
console.log(` RESULTADO DOS TESTES: ${passedCount} / 12 PASSED`);
console.log("--------------------------------------------------\n");

if (passedCount < 12) {
  process.exit(1);
}
