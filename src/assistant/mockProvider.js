import { LUX_STATES } from "./assistantState.js";
import { LUX_MESSAGES, FALLBACK_QUICK_REPLIES } from "./luxMessages.js";

/**
 * Fallback técnico para quando a API ou o Gemini estivem indisponíveis/com timeout.
 * Não simula busca nem atua como bot inteligente local.
 */
export function resolveMockMessage() {
  return {
    text: LUX_MESSAGES.API_ERROR,
    context: {
      flow: "fallback",
      requestedWhatsApp: false,
    },
    quickReplies: [...FALLBACK_QUICK_REPLIES],
    nextState: LUX_STATES.ERROR_SOFT,
    completed: false,
  };
}

export const mockProvider = {
  async sendMessage(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return resolveMockMessage(payload);
  },
};


