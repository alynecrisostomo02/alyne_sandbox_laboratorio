import { LUX_MESSAGES, INITIAL_QUICK_REPLIES as MSG_INITIAL_REPLIES } from "./luxMessages.js";

export const LUX_STATES = Object.freeze({
  IDLE: "idle",
  LISTENING: "listening",
  THINKING: "thinking",
  TALKING: "talking",
  SUCCESS: "success",
  ALERT: "alert",
  ERROR_SOFT: "error_soft",
  CTA_WHATSAPP: "cta_whatsapp",
});

export const INITIAL_QUICK_REPLIES = MSG_INITIAL_REPLIES;

export const CAPTURE_FIELDS = Object.freeze([
  {
    key: "propertyType",
    prompt: "Qual é o tipo do imóvel?",
    quickReplies: ["Casa", "Apartamento", "Terreno", "Imóvel comercial", "Ainda vou confirmar"],
  },
  {
    key: "purpose",
    prompt: "O imóvel será anunciado para venda ou para locação?",
    quickReplies: ["Venda", "Locação", "Ainda vou confirmar"],
  },
  {
    key: "region",
    prompt: "Em qual bairro ou região ele fica? Não precisa informar o endereço completo.",
    quickReplies: ["Não sei", "Ainda vou confirmar", "Prefiro falar disso no WhatsApp"],
  },
  {
    key: "area",
    prompt: "Qual é a metragem aproximada?",
    quickReplies: ["Não sei", "Ainda vou confirmar"],
  },
  {
    key: "bedrooms",
    prompt: "Quantos quartos o imóvel possui?",
    quickReplies: ["1", "2", "3", "4 ou mais", "Não sei"],
  },
  {
    key: "suites",
    prompt: "Quantas suítes?",
    quickReplies: ["Nenhuma", "1", "2", "3 ou mais", "Não sei"],
  },
  {
    key: "bathrooms",
    prompt: "Quantos banheiros ao todo?",
    quickReplies: ["1", "2", "3", "4 ou mais", "Não sei"],
  },
  {
    key: "garage",
    prompt: "Como é a garagem ou quantas vagas existem?",
    quickReplies: ["Sem garagem", "1 vaga", "2 vagas", "3 ou mais", "Não sei"],
  },
  {
    key: "price",
    prompt: "Qual é o valor pretendido aproximado?",
    quickReplies: ["Ainda vou confirmar", "Prefiro falar disso no WhatsApp"],
  },
  {
    key: "features",
    prompt: "Quais são os principais diferenciais? Por exemplo: piscina, área gourmet ou energia solar.",
    quickReplies: ["Não sei", "Ainda vou confirmar"],
  },
  {
    key: "documentation",
    prompt: "Como está a situação documental do imóvel?",
    quickReplies: ["Documentação regular", "Ainda vou confirmar", "Não sei"],
  },
  {
    key: "photos",
    prompt: "Você já possui fotos do imóvel?",
    quickReplies: ["Sim, já tenho fotos", "Ainda não", "Ainda vou confirmar"],
  },
  {
    key: "name",
    prompt: "Se quiser, informe seu primeiro nome para o resumo. Esse campo é opcional.",
    quickReplies: ["Prefiro não informar"],
  },
]);

export function createInitialAssistantContext() {
  return {
    flow: "general",
    capture: {},
    userPreferences: {},
    captureIndex: 0,
    completed: false,
    requestedWhatsApp: false,
  };
}

export function createInitialMessages() {
  return [
    {
      id: "assistant-0",
      role: "assistant",
      text: LUX_MESSAGES.WELCOME,
    },
  ];
}

export function isLuxState(value) {
  return Object.values(LUX_STATES).includes(value);
}

