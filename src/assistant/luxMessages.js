/**
 * LUX MESSAGES & LOCAL TEXTS
 * Centraliza todas as mensagens estáticas, boas-vindas e quick replies locais.
 * NENHUMA resposta factual sobre catálogo ou imóveis é definida aqui.
 */

export const LUX_MESSAGES = Object.freeze({
  WELCOME: "Olá! Eu sou a Assistente Crisostomo. Como posso ajudar você hoje?",
  RESTART: "Tudo certo. Começamos de novo por aqui.",
  WAITING: "Só um instante, estou consultando o catálogo...",
  API_ERROR: "Não consegui consultar o catálogo agora. Quer tentar de novo ou falar direto com a Alyne?",
  OFFLINE: "Parece que estamos sem conexão. Quando ela voltar, posso continuar daqui.",
  EMPTY_INPUT: "Por favor, digite sua mensagem ou escolha uma das opções abaixo.",
  PRIVACY_NOTE: "Não envie CPF, RG, dados bancários ou documentos por aqui.",
  WHATSAPP_HANDOFF: "Posso encaminhar o resumo da conversa para a Alyne no WhatsApp.",
});

export const INITIAL_QUICK_REPLIES = Object.freeze([
  "Quero comprar um imóvel",
  "Quero alugar um imóvel",
  "Explorar Redenção, Pará",
]);

export const FALLBACK_QUICK_REPLIES = Object.freeze([
  "Tentar novamente",
  "Falar com Alyne",
]);

export const RESTART_QUICK_REPLIES = Object.freeze([
  "Quero comprar um imóvel",
  "Quero alugar um imóvel",
  "Explorar Redenção, Pará",
  "Falar com Alyne",
]);
