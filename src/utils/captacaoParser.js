/**
 * Parser inteligente de dados brutos e integrações para Fichas de Captação
 */

const PROPERTY_TYPES = ["Casa", "Apartamento", "Terreno", "Comercial", "Chácara", "Fazenda", "Outro"];
const PURPOSES = ["Venda", "Locação", "Venda ou locação"];
const DIFFERENTIALS = ["Piscina", "Energia solar", "Planejados", "Poço artesiano", "Churrasqueira"];

/**
 * Normaliza e limpa strings
 */
function clean(val) {
  return String(val || "").trim();
}

/**
 * Extrai dados estruturados a partir de texto bruto (WhatsApp, anotações, e-mails).
 */
export function parseRawTextToCaptacao(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return { form: {}, differentials: {}, detectedFields: [] };
  }

  const text = rawText.replace(/\r\n/g, "\n");
  const form = {
    propertyType: "",
    purpose: "",
    owner: "",
    phone: "",
    neighborhood: "",
    condominium: "",
    address: "",
    bedrooms: "",
    suites: "",
    bathrooms: "",
    builtArea: "",
    landArea: "",
    parkingSpaces: "",
    price: "",
    notes: "",
  };
  const differentials = {};
  const detected = [];

  // 1. Tipo do imóvel
  const lower = text.toLowerCase();
  if (/\b(casa|sobrado|resid[eê]ncia)\b/i.test(lower)) {
    form.propertyType = "Casa";
    detected.push("Tipo: Casa");
  } else if (/\b(apartamento|apto|flat|cobertura)\b/i.test(lower)) {
    form.propertyType = "Apartamento";
    detected.push("Tipo: Apartamento");
  } else if (/\b(terreno|lote|loteamento)\b/i.test(lower)) {
    form.propertyType = "Terreno";
    detected.push("Tipo: Terreno");
  } else if (/\b(comercial|sala|ponto|galp[aã]o|loja|pr[eé]dio)\b/i.test(lower)) {
    form.propertyType = "Comercial";
    detected.push("Tipo: Comercial");
  } else if (/\b(ch[aá]cara|sitio|s[ií]tio)\b/i.test(lower)) {
    form.propertyType = "Chácara";
    detected.push("Tipo: Chácara");
  } else if (/\b(fazenda|haras|gleba)\b/i.test(lower)) {
    form.propertyType = "Fazenda";
    detected.push("Tipo: Fazenda");
  }

  // 2. Finalidade
  if (/\b(loca[cç][aã]o|aluguel|alugar|locar)\b/i.test(lower) && /\b(venda|vender|comprar)\b/i.test(lower)) {
    form.purpose = "Venda ou locação";
    detected.push("Finalidade: Venda ou locação");
  } else if (/\b(loca[cç][aã]o|aluguel|alugar|locar)\b/i.test(lower)) {
    form.purpose = "Locação";
    detected.push("Finalidade: Locação");
  } else if (/\b(venda|vender|comprar|im[oó]vel [aà] venda)\b/i.test(lower) || !form.purpose) {
    form.purpose = "Venda";
    detected.push("Finalidade: Venda");
  }

  // 3. Proprietário / Contato
  const ownerMatch =
    text.match(/(?:propriet[aá]ri[oa]|cliente|dono|contato|vendedor|locador|nome)[\s:]+([^\n,;]+)/i) ||
    text.match(/(?:falar com|tratar com)[\s:]+([^\n,;]+)/i);
  if (ownerMatch && ownerMatch[1]) {
    form.owner = clean(ownerMatch[1]);
    detected.push(`Proprietário: ${form.owner}`);
  }

  // 4. Telefone / WhatsApp
  const phoneMatch =
    text.match(/(?:\+?55\s*)?(?:\(?([1-9][0-9])\)?\s*)?(9[0-9]{4}[-\s]?[0-9]{4}|[2-8][0-9]{3}[-\s]?[0-9]{4})/);
  if (phoneMatch) {
    const rawDigits = phoneMatch[0].replace(/\D/g, "");
    if (rawDigits.length >= 10) {
      const ddd = rawDigits.slice(-11, -9);
      const number = rawDigits.slice(-9);
      form.phone = `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
      detected.push(`Telefone: ${form.phone}`);
    } else {
      form.phone = phoneMatch[0].trim();
      detected.push(`Telefone: ${form.phone}`);
    }
  }

  // 5. Bairro / Condomínio / Endereço
  const neighMatch = text.match(/(?:bairro|setor|regi[aã]o)[\s:]+([^\n,;]+)/i);
  if (neighMatch && neighMatch[1]) {
    form.neighborhood = clean(neighMatch[1]);
    detected.push(`Bairro: ${form.neighborhood}`);
  }

  const condMatch = text.match(/(?:condom[ií]nio|cond\.?|reserva|village|park|parque|edif[ií]cio|ed\.?)[\s:]+([^\n,;]+)/i);
  if (condMatch && condMatch[1]) {
    form.condominium = clean(condMatch[1]);
    detected.push(`Condomínio: ${form.condominium}`);
  }

  const addrMatch = text.match(/(?:endere[cç]o|rua|av\.?|avenida|alameda|quadra|qd\.?|lote|lt\.?)[\s:]+([^\n;]+)/i);
  if (addrMatch && addrMatch[1]) {
    form.address = clean(addrMatch[1]);
    detected.push(`Endereço: ${form.address}`);
  }

  // 6. Quartos / Suítes / Banheiros / Vagas
  const bedMatch = text.match(/(\d+)\s*(?:quartos?|qts?|dormit[oó]rios?|dorms?)/i);
  if (bedMatch) {
    form.bedrooms = bedMatch[1];
    detected.push(`Quartos: ${form.bedrooms}`);
  }

  const suiteMatch = text.match(/(\d+)\s*(?:su[ií]tes?|sts?)/i);
  if (suiteMatch) {
    form.suites = suiteMatch[1];
    detected.push(`Suítes: ${form.suites}`);
  }

  const bathMatch = text.match(/(\d+)\s*(?:banheiros?|bwc|lavabos?|wcs?)/i);
  if (bathMatch) {
    form.bathrooms = bathMatch[1];
    detected.push(`Banheiros: ${form.bathrooms}`);
  }

  const parkMatch = text.match(/(\d+)\s*(?:vagas?|garagens?|garagem|carros?)/i);
  if (parkMatch) {
    form.parkingSpaces = parkMatch[1];
    detected.push(`Vagas: ${form.parkingSpaces}`);
  }

  // 7. Metragem (Área construída e Terreno)
  const builtMatch =
    text.match(/(?:[aá]rea\s*constru[ií]da|constru[cç][aã]o|ac|a\.c\.)[\s:]*(\d+[\.,]?\d*)\s*(?:m[²2]|metros)/i) ||
    text.match(/(\d+[\.,]?\d*)\s*(?:m[²2]|metros)\s*(?:constru[ií]dos?|de\s*constru[cç][aã]o)/i);
  if (builtMatch) {
    form.builtArea = builtMatch[1].replace(",", ".");
    detected.push(`Área Construída: ${form.builtArea} m²`);
  }

  const landMatch =
    text.match(/(?:[aá]rea\s*(?:do\s*)?terreno|terreno|total|lote)[\s:]*(\d+[\.,]?\d*)\s*(?:m[²2]|metros)/i) ||
    text.match(/(\d+[\.,]?\d*)\s*(?:m[²2]|metros)\s*(?:de\s*terreno|de\s*[aá]rea\s*total)/i);
  if (landMatch) {
    form.landArea = landMatch[1].replace(",", ".");
    detected.push(`Área Terreno: ${form.landArea} m²`);
  }

  // 8. Diferenciais
  if (/\b(piscina|hidro|deck molhado)\b/i.test(lower)) {
    differentials["Piscina"] = true;
    detected.push("Diferencial: Piscina");
  }
  if (/\b(energia solar|fotovoltaica|placas solares)\b/i.test(lower)) {
    differentials["Energia solar"] = true;
    detected.push("Diferencial: Energia solar");
  }
  if (/\b(planejados?|arm[aá]rios embutidos?|marcenaria|cozinha montada)\b/i.test(lower)) {
    differentials["Planejados"] = true;
    detected.push("Diferencial: Planejados");
  }
  if (/\b(po[cç]o artesiano|po[cç]o semi[- ]artesiano)\b/i.test(lower)) {
    differentials["Poço artesiano"] = true;
    detected.push("Diferencial: Poço artesiano");
  }
  if (/\b(churrasqueira|gourmet|[aá]rea gourmet|parrilla)\b/i.test(lower)) {
    differentials["Churrasqueira"] = true;
    detected.push("Diferencial: Churrasqueira");
  }

  // 9. Observações / Descrição adicional
  const notesMatch = text.match(/(?:observa[cç][oõ]es|obs|descri[cç][aã]o|detalhes|informa[cç][oõ]es)[\s:]+([^\0]+)/i);
  if (notesMatch && notesMatch[1]) {
    form.notes = clean(notesMatch[1]).slice(0, 500);
  } else {
    // Se sobrar texto relevante que não foi mapeado
    const summaryLines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("---"));
    if (summaryLines.length > 0 && !form.notes) {
      form.notes = summaryLines.join(" | ").slice(0, 480);
    }
  }

  return {
    form,
    differentials,
    detectedFields: detected,
  };
}

/**
 * Converte linhas de CSV/Tabela para objeto de captação
 */
export function parseCsvOrRowToCaptacao(headers, row) {
  const form = {
    propertyType: "",
    purpose: "Venda",
    owner: "",
    phone: "",
    neighborhood: "",
    condominium: "",
    address: "",
    bedrooms: "",
    suites: "",
    bathrooms: "",
    builtArea: "",
    landArea: "",
    parkingSpaces: "",
    notes: "",
  };
  const differentials = {};
  const detected = [];

  headers.forEach((header, index) => {
    const key = header.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const val = clean(row[index]);
    if (!val) return;

    if (key.includes("tipo") || key.includes("categoria")) {
      const match = PROPERTY_TYPES.find((t) => val.toLowerCase().includes(t.toLowerCase()));
      form.propertyType = match || val;
      detected.push(`Tipo: ${form.propertyType}`);
    } else if (key.includes("finalidade") || key.includes("negocio") || key.includes("transacao")) {
      if (val.toLowerCase().includes("loca") || val.toLowerCase().includes("alug")) form.purpose = "Locação";
      else form.purpose = "Venda";
      detected.push(`Finalidade: ${form.purpose}`);
    } else if (key.includes("proprietario") || key.includes("cliente") || key.includes("nome") || key.includes("contato")) {
      form.owner = val;
      detected.push(`Proprietário: ${form.owner}`);
    } else if (key.includes("telefone") || key.includes("celular") || key.includes("whatsapp") || key.includes("fone")) {
      form.phone = val;
      detected.push(`Telefone: ${form.phone}`);
    } else if (key.includes("bairro") || key.includes("setor")) {
      form.neighborhood = val;
      detected.push(`Bairro: ${form.neighborhood}`);
    } else if (key.includes("condominio") || key.includes("edificio") || key.includes("residencial")) {
      form.condominium = val;
      detected.push(`Condomínio: ${form.condominium}`);
    } else if (key.includes("endereco") || key.includes("rua") || key.includes("localizacao") || key.includes("logradouro")) {
      form.address = val;
      detected.push(`Endereço: ${form.address}`);
    } else if (key.includes("quarto") || key.includes("dorm")) {
      form.bedrooms = val.replace(/\D/g, "");
      detected.push(`Quartos: ${form.bedrooms}`);
    } else if (key.includes("suite")) {
      form.suites = val.replace(/\D/g, "");
      detected.push(`Suítes: ${form.suites}`);
    } else if (key.includes("banheiro") || key.includes("bwc")) {
      form.bathrooms = val.replace(/\D/g, "");
      detected.push(`Banheiros: ${form.bathrooms}`);
    } else if (key.includes("vaga") || key.includes("garagem")) {
      form.parkingSpaces = val.replace(/\D/g, "");
      detected.push(`Vagas: ${form.parkingSpaces}`);
    } else if (key.includes("construida") || key.includes("area util") || key.includes("metragem")) {
      form.builtArea = val.replace(/[^\d.,]/g, "").replace(",", ".");
      detected.push(`Área Construída: ${form.builtArea} m²`);
    } else if (key.includes("terreno") || key.includes("total") || key.includes("lote")) {
      form.landArea = val.replace(/[^\d.,]/g, "").replace(",", ".");
      detected.push(`Área Terreno: ${form.landArea} m²`);
    } else if (key.includes("piscina")) {
      differentials["Piscina"] = val.toLowerCase().includes("s") || val === "1" || val.toLowerCase().includes("sim");
      if (differentials["Piscina"]) detected.push("Diferencial: Piscina");
    } else if (key.includes("solar") || key.includes("fotovolt")) {
      differentials["Energia solar"] = val.toLowerCase().includes("s") || val === "1" || val.toLowerCase().includes("sim");
      if (differentials["Energia solar"]) detected.push("Diferencial: Energia solar");
    } else if (key.includes("planejado") || key.includes("armario")) {
      differentials["Planejados"] = val.toLowerCase().includes("s") || val === "1" || val.toLowerCase().includes("sim");
      if (differentials["Planejados"]) detected.push("Diferencial: Planejados");
    } else if (key.includes("poco")) {
      differentials["Poço artesiano"] = val.toLowerCase().includes("s") || val === "1" || val.toLowerCase().includes("sim");
      if (differentials["Poço artesiano"]) detected.push("Diferencial: Poço artesiano");
    } else if (key.includes("churrasqueira") || key.includes("gourmet")) {
      differentials["Churrasqueira"] = val.toLowerCase().includes("s") || val === "1" || val.toLowerCase().includes("sim");
      if (differentials["Churrasqueira"]) detected.push("Diferencial: Churrasqueira");
    } else if (key.includes("obs") || key.includes("nota") || key.includes("descricao") || key.includes("comentario")) {
      form.notes = val.slice(0, 500);
    }
  });

  return { form, differentials, detectedFields: detected };
}

/**
 * Exemplos pré-configurados de respostas de Google Forms da imobiliária
 */
export const SAMPLE_GOOGLE_FORMS_RESPONSES = [
  {
    id: "gform-001",
    timestamp: "Hoje, 10:45",
    formTitle: "Formulário Oficial de Captação - Alyne Crisóstomo",
    respondent: "Carlos Eduardo Silveira",
    phone: "(94) 99182-3344",
    summary: "Casa de Alto Padrão • Park dos Buritis I • R$ 980.000,00",
    data: {
      form: {
        propertyType: "Casa",
        purpose: "Venda",
        owner: "Carlos Eduardo Silveira",
        phone: "(94) 99182-3344",
        neighborhood: "Park dos Buritis I",
        condominium: "Residencial Buritis",
        address: "Av. Principal, Qd 12, Lt 08",
        bedrooms: "3",
        suites: "2",
        bathrooms: "3",
        builtArea: "215",
        landArea: "360",
        parkingSpaces: "2",
        notes: "Casa térrea com acabamento em porcelanato acetinado, iluminação em LED e aquecimento solar. Pronta para financiamento pela Caixa.",
      },
      differentials: {
        Piscina: true,
        "Energia solar": true,
        Planejados: true,
        "Poço artesiano": false,
        Churrasqueira: true,
      },
    },
  },
  {
    id: "gform-002",
    timestamp: "Ontem, 16:20",
    formTitle: "Formulário de Captação Rápida - WhatsApp",
    respondent: "Mariana Alencar Guimarães",
    phone: "(94) 98114-9900",
    summary: "Apartamento 3 Quartos • Centro • R$ 450.000,00",
    data: {
      form: {
        propertyType: "Apartamento",
        purpose: "Venda",
        owner: "Mariana Alencar Guimarães",
        phone: "(94) 98114-9900",
        neighborhood: "Centro",
        condominium: "Edifício Sol Nascente",
        address: "Rua Rui Barbosa, 450 - Apto 602",
        bedrooms: "3",
        suites: "1",
        bathrooms: "2",
        builtArea: "98",
        landArea: "",
        parkingSpaces: "2",
        notes: "Apartamento com sacada gourmet voltada para o nascente. Armários planejados na cozinha e suíte principal. Taxa de condomínio R$ 380/mês.",
      },
      differentials: {
        Piscina: true,
        "Energia solar": false,
        Planejados: true,
        "Poço artesiano": false,
        Churrasqueira: true,
      },
    },
  },
  {
    id: "gform-003",
    timestamp: "18/08/2026, 14:10",
    formTitle: "Captação Terrenos e Loteamentos",
    respondent: "Roberto Mendes de Oliveira",
    phone: "(94) 99205-7711",
    summary: "Terreno Comercial • Av. Brasil • R$ 320.000,00",
    data: {
      form: {
        propertyType: "Terreno",
        purpose: "Venda",
        owner: "Roberto Mendes de Oliveira",
        phone: "(94) 99205-7711",
        neighborhood: "Alto Paraná",
        condominium: "",
        address: "Av. Brasil, esquina com Rua 14",
        bedrooms: "",
        suites: "",
        bathrooms: "",
        builtArea: "",
        landArea: "450",
        parkingSpaces: "",
        notes: "Excelente terreno de esquina com 15x30m, topografia plana, asfalto e água encanada. Ideal para prédio comercial ou galpão.",
      },
      differentials: {
        Piscina: false,
        "Energia solar": false,
        Planejados: false,
        "Poço artesiano": true,
        Churrasqueira: false,
      },
    },
  },
];

/**
 * Modelos/Arquivos de Exemplo do Google Drive
 */
export const SAMPLE_GOOGLE_DRIVE_FILES = [
  {
    id: "gdrive-doc-01",
    name: "Ficha_Tecnica_Casa_Jardim_Europa.docx",
    mimeType: "application/vnd.google-apps.document",
    type: "doc",
    size: "245 KB",
    updatedAt: "Hoje, 09:15",
    icon: "fileText",
    content: `FICHA DE CAPTAÇÃO IMOBILIÁRIA
Tipo: Casa Residencial de Alto Padrão
Finalidade: Venda
Proprietário: Marcos Vinícius Ferreira
Telefone: (94) 99177-8899
Localização: Jardim Europa, Redenção - PA
Endereço: Alameda das Palmeiras, 145
Quartos: 4 quartos (sendo 2 suítes master com closet)
Banheiros: 4 banheiros + 1 lavabo
Vagas de garagem: 3 vagas cobertas
Área Construída: 280 m²
Área do Terreno: 420 m²
Diferenciais: Piscina aquecida com cascata, Energia solar fotovoltaica 800kWh, Armários planejados em todos os cômodos, Poço artesiano e Espaço gourmet com churrasqueira.
Observações: Documentação 100% regular com Habite-se averbado. Aceita permuta por veículo ou lote comercial de menor valor.`,
  },
  {
    id: "gdrive-sheet-02",
    name: "Planilha_Captacoes_Agosto_2026.xlsx",
    mimeType: "application/vnd.google-apps.spreadsheet",
    type: "sheet",
    size: "1.2 MB",
    updatedAt: "Ontem, 18:30",
    icon: "fileText",
    rows: [
      {
        propertyType: "Casa",
        purpose: "Venda",
        owner: "Luciana Bastos",
        phone: "(94) 98122-4455",
        neighborhood: "Vila Paulista",
        condominium: "",
        address: "Rua 07, nº 310",
        bedrooms: "3",
        suites: "1",
        bathrooms: "2",
        builtArea: "160",
        landArea: "300",
        parkingSpaces: "2",
        notes: "Casa recém reformada, telhado novo, piso porcelanato e portão eletrônico.",
      },
    ],
  },
  {
    id: "gdrive-form-03",
    name: "Respostas_Formulario_Site_Alyne.gform",
    mimeType: "application/vnd.google-apps.form",
    type: "form",
    size: "318 KB",
    updatedAt: "17/08/2026",
    icon: "fileText",
  },
];
