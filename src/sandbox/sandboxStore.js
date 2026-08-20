export const INITIAL_SANDBOX_MODULES = [
  {
    id: "mod-calc-financiamento",
    name: "Calculadora de Financiamento & Amortização SAC / Price",
    version: "1.2.0",
    description: "Simulador interativo de crédito imobiliário com taxas dos principais bancos (Caixa, BB, Itaú) e comparativo de parcelas para imóveis de Redenção - PA.",
    author: "AI Studio Lab",
    createdAt: "2026-08-14T14:20:00Z",
    updatedAt: "2026-08-18T10:00:00Z",
    status: "active_sandbox", // testing, active_sandbox, inactive_sandbox, deployed, archived
    riskLevel: "low", // low, medium, high
    category: "Ferramenta de Conversão",
    sourceType: "zip",
    originalFileName: "calculadora-financiamento-v1.2.0.zip",
    fileCount: 4,
    dependencies: {
      "recharts": "^2.12.0",
      "lucide-react": "^0.344.0"
    },
    envRequired: [],
    apiEndpoints: ["/api/sandbox/simulacao-credito"],
    files: [
      {
        path: "src/components/FinanciamentoCalc.jsx",
        type: "component",
        status: "new",
        size: 8420,
        content: `// Componente de Simulação de Financiamento Habitacional
// Integração pronta para catálogo de Redenção`
      },
      {
        path: "src/utils/calcFinanciamento.js",
        type: "utility",
        status: "new",
        size: 3210,
        content: `// Cálculos de amortização SAC e Tabela Price`
      },
      {
        path: "app/api/sandbox/simulacao-credito/route.js",
        type: "api",
        status: "new",
        size: 1450,
        content: `// Endpoint de registro e exportação de proposta de simulação`
      },
      {
        path: "docs/FINANCIAMENTO_README.md",
        type: "doc",
        status: "new",
        size: 980,
        content: `# Calculadora de Financiamento Habitacional\nGuia de uso e parâmetros bancários.`
      }
    ],
    versions: [
      {
        version: "1.2.0",
        date: "2026-08-18T10:00:00Z",
        notes: "Adicionado comparador SAC x Price e botão direto para envio ao WhatsApp da corretora.",
        status: "active_sandbox"
      },
      {
        version: "1.1.0",
        date: "2026-08-15T18:30:00Z",
        notes: "Ajuste na taxa referencial da Caixa Econômica e campo de entrada mínima (20%).",
        status: "archived"
      },
      {
        version: "1.0.0",
        date: "2026-08-14T14:20:00Z",
        notes: "Versão inicial importada via ZIP do AI Studio.",
        status: "archived"
      }
    ],
    previewType: "calculator"
  },
  {
    id: "mod-agenda-visitas",
    name: "Agendador de Visitas Inteligente & Tour Virtual",
    version: "1.0.1",
    description: "Módulo para agendamento de visitas presenciais ou tours online com seleção de horários disponíveis e sincronização direta no WhatsApp.",
    author: "Alyne Tech Studio",
    createdAt: "2026-08-16T11:45:00Z",
    updatedAt: "2026-08-18T09:15:00Z",
    status: "testing",
    riskLevel: "low",
    category: "Atendimento & Agendamento",
    sourceType: "zip",
    originalFileName: "agendador-visitas-redencao-v1.0.1.zip",
    fileCount: 3,
    dependencies: {
      "date-fns": "^3.3.1"
    },
    envRequired: [],
    apiEndpoints: ["/api/sandbox/agendamentos"],
    files: [
      {
        path: "src/components/AgendadorVisitaModal.jsx",
        type: "component",
        status: "new",
        size: 6120,
        content: `// Modal de escolha de data e horário com verificação de agenda`
      },
      {
        path: "src/utils/horariosDisponiveis.js",
        type: "utility",
        status: "new",
        size: 2100,
        content: `// Validador de dias úteis e sábados de plantão em Redenção`
      },
      {
        path: "app/api/sandbox/agendamentos/route.js",
        type: "api",
        status: "new",
        size: 1840,
        content: `// Registro seguro de intenção de visita`
      }
    ],
    versions: [
      {
        version: "1.0.1",
        date: "2026-08-18T09:15:00Z",
        notes: "Validação de turnos matutino e vespertino com intervalo de almoço.",
        status: "testing"
      },
      {
        version: "1.0.0",
        date: "2026-08-16T11:45:00Z",
        notes: "Carga inicial do componente de calendário.",
        status: "archived"
      }
    ],
    previewType: "scheduler"
  },
  {
    id: "mod-simulador-itbi",
    name: "Simulador de Custos Notariais, ITBI e Escritura",
    version: "0.9.4",
    description: "Calculadora de taxas cartorárias, taxa de avaliação bancária, escritura pública e ITBI municipal para Redenção (alíquota 2.5%).",
    author: "AI Studio Lab",
    createdAt: "2026-08-12T16:00:00Z",
    updatedAt: "2026-08-17T14:30:00Z",
    status: "inactive_sandbox",
    riskLevel: "medium",
    category: "Documentação & Jurídico",
    sourceType: "zip",
    originalFileName: "simulador-itbi-cartorio-pa.zip",
    fileCount: 3,
    dependencies: {},
    envRequired: [],
    apiEndpoints: [],
    files: [
      {
        path: "src/components/SimuladorCustosCartorio.jsx",
        type: "component",
        status: "new",
        size: 5320,
        content: `// Tabela progressiva de emolumentos do Tribunal de Justiça do Pará`
      },
      {
        path: "src/utils/tabelaEmolumentosPA.js",
        type: "utility",
        status: "new",
        size: 4100,
        content: `// Faixas de emolumentos de registro de imóveis do Pará 2026`
      },
      {
        path: "docs/TABELA_NOTARIAL_PA_2026.md",
        type: "doc",
        status: "new",
        size: 1540,
        content: `// Resumo de taxas cartorárias oficiais`
      }
    ],
    versions: [
      {
        version: "0.9.4",
        date: "2026-08-17T14:30:00Z",
        notes: "Atualização das faixas de emolumentos do Estado do Pará.",
        status: "inactive_sandbox"
      }
    ],
    previewType: "itbi_calculator"
  }
];

export const INITIAL_SYSTEM_SNAPSHOTS = [
  {
    id: "snp-20260818-1000",
    name: "Snapshot do Sistema — Antes do Módulo de Financiamento",
    createdAt: "2026-08-18T10:00:00Z",
    createdBy: "admin@alynecrisostomo.com.br",
    description: "Backup preventivo gerado antes do registro de testes do simulador na Sandbox.",
    fileCount: 142,
    size: "4.8 MB",
    type: "automatic"
  },
  {
    id: "snp-20260815-1800",
    name: "Snapshot de Produção — Versão Laboratório Estável",
    createdAt: "2026-08-15T18:00:00Z",
    createdBy: "alyne@alynecrisostomo.com.br",
    description: "Ponto de restauração após validação do catálogo com 12 imóveis e logos verificadas.",
    fileCount: 138,
    size: "4.6 MB",
    type: "manual"
  }
];
