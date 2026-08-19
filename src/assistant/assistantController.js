import { assistantProvider, isAssistantProvider } from "./assistantProvider.js";
import {
  INITIAL_QUICK_REPLIES,
  LUX_STATES,
  createInitialAssistantContext,
  createInitialMessages,
  isLuxState,
} from "./assistantState.js";

const OMITTED_VALUES = new Set([
  "não sei",
  "nao sei",
  "ainda vou confirmar",
  "prefiro falar disso no whatsapp",
  "prefiro não informar",
  "prefiro nao informar",
]);

function hasPublicValue(value) {
  return Boolean(value && !OMITTED_VALUES.has(value.trim().toLowerCase()));
}

function message(role, text, index, extras = {}) {
  return { id: `${role}-${index}`, role, text, ...extras };
}

export function createAssistantSession() {
  return {
    messages: createInitialMessages(),
    context: createInitialAssistantContext(),
    quickReplies: [...INITIAL_QUICK_REPLIES],
    summary: "",
  };
}

export function stageUserMessage(session, text) {
  const trimmedText = text.trim();
  if (!trimmedText) return session;

  return {
    ...session,
    messages: [
      ...session.messages,
      message("user", trimmedText, session.messages.length),
    ],
  };
}

export async function sendAssistantTurn(session, text, provider = assistantProvider) {
  if (!isAssistantProvider(provider)) throw new Error("Assistant provider is unavailable.");

  const trimmedText = text.trim();
  if (!trimmedText) return session;

  const stagedSession = stageUserMessage(session, trimmedText);
  const messages = stagedSession.messages;
  const providerResponse = await provider.sendMessage({
    messages,
    context: session.context,
  });
  const context = providerResponse.context || session.context;
  const nextState = isLuxState(providerResponse.nextState)
    ? providerResponse.nextState
    : LUX_STATES.LISTENING;
  const nextMessages = [
    ...messages,
    message("assistant", providerResponse.text, messages.length),
  ];
  const summary = providerResponse.completed ? buildWhatsAppSummary(context) : session.summary;

  if (providerResponse.completed && summary) {
    nextMessages.push(message("assistant", summary, nextMessages.length, { kind: "summary" }));
  }

  return {
    messages: nextMessages,
    context,
    quickReplies: providerResponse.quickReplies || [],
    summary,
    nextState,
    completed: Boolean(providerResponse.completed),
  };
}

export function appendAssistantError(session) {
  return {
    ...session,
    messages: [
      ...session.messages,
      message(
        "assistant",
        "Não consegui continuar agora, mas suas informações locais não foram enviadas. Você pode tentar novamente ou falar com a Alyne.",
        session.messages.length
      ),
    ],
    quickReplies: ["Tentar novamente", "Falar com Alyne"],
  };
}

export function buildWhatsAppSummary(context) {
  const capture = context?.capture || {};
  const lines = [];
  const name = hasPublicValue(capture.name) ? capture.name.trim() : "";
  const propertyType = hasPublicValue(capture.propertyType)
    ? capture.propertyType.trim().toLowerCase()
    : "imóvel";
  const purpose = hasPublicValue(capture.purpose)
    ? capture.purpose.trim().toLowerCase()
    : "anúncio";
  const region = hasPublicValue(capture.region) ? ` na região de ${capture.region.trim()}` : "";

  lines.push(`Olá, Alyne.${name ? ` Meu nome é ${name}.` : ""}`);

  if (context?.flow === "capture" || Object.keys(capture).length > 0) {
    const purposeText = purpose === "venda"
      ? "para venda"
      : purpose === "locação" || purpose === "locacao"
        ? "para locação"
        : "para anunciar";
    lines.push(`Gostaria de anunciar um imóvel do tipo ${propertyType} ${purposeText}${region}.`);

    const facts = [];
    if (hasPublicValue(capture.area)) facts.push(`metragem aproximada: ${capture.area.trim()}`);
    if (hasPublicValue(capture.bedrooms)) facts.push(`${capture.bedrooms.trim()} quarto(s)`);
    if (hasPublicValue(capture.suites)) facts.push(`${capture.suites.trim()} suíte(s)`);
    if (hasPublicValue(capture.bathrooms)) facts.push(`${capture.bathrooms.trim()} banheiro(s)`);
    if (hasPublicValue(capture.garage)) facts.push(capture.garage.trim());
    if (facts.length) lines.push(`Informações principais: ${facts.join(", ")}.`);

    if (hasPublicValue(capture.features)) lines.push(`Diferenciais: ${capture.features.trim()}.`);
    if (hasPublicValue(capture.price)) lines.push(`Valor pretendido aproximado: ${capture.price.trim()}.`);
    if (hasPublicValue(capture.documentation)) lines.push(`Situação documental: ${capture.documentation.trim()}.`);
    if (hasPublicValue(capture.photos)) lines.push(`Fotos: ${capture.photos.trim()}.`);
  } else {
    lines.push("Conversei com a Assistente Crisostomo no site e gostaria de continuar o atendimento.");
  }

  return lines.join("\n");
}
