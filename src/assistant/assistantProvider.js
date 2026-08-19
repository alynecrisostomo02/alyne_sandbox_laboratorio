import { geminiProvider } from "./geminiProvider.js";

/**
 * Provider contract:
 * sendMessage({ messages, context }) => Promise<{
 *   text, context, quickReplies, nextState, completed
 * }>
 */
export function isAssistantProvider(provider) {
  return Boolean(provider && typeof provider.sendMessage === "function");
}

// The browser calls only the same-origin /api/lux route. The Gemini key remains
// available exclusively to the Cloudflare Worker.
export const assistantProvider = geminiProvider;
