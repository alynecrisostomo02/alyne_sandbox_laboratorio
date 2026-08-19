import { LUX_STATES, createInitialAssistantContext } from "./assistantState.js";
import { resolveMockMessage } from "./mockProvider.js";
import { properties } from "../properties.js";

const GEMINI_ENDPOINT = "/api/lux";
const REQUEST_TIMEOUT = 30000;

/*
 * Catálogo público enviado para a Assistente Crisostomo.
 * Não enviamos fotos, vídeos ou arquivos.
 */
const publicCatalog = properties.map((property) => ({
  id: property.id,
  idRef: property.idRef,
  slug: property.slug,

  title: property.title,
  purpose: property.purpose,
  type: property.type,

  city: property.city,
  neighborhood: property.neighborhood,
  publicLocation: property.publicLocation,

  price: property.price,
  priceOnRequest: property.priceOnRequest,
  priceNote: property.priceNote,

  condominiumFee: property.condominiumFee,
  fees: property.fees,
  conditions: property.conditions,

  bedrooms: property.bedrooms,
  suites: property.suites,
  bathrooms: property.bathrooms,
  lavabos: property.lavabos,
  parking: property.parking,

  builtArea: property.builtArea,
  landArea: property.landArea,
  landDimensions: property.landDimensions,

  status: property.status,

  shortDescription: property.shortDescription,

  features: property.features,
  amenities: property.amenities,

  documents: property.documents,
  financeable: property.financeable,
  furnished: property.furnished,
}));

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function makeFallback(messages, context, softError = true) {
  const localResponse = resolveMockMessage({
    messages,
    context,
  });

  if (!softError) {
    return localResponse;
  }

  return {
    ...localResponse,
    nextState: LUX_STATES.ERROR_SOFT,
  };
}

export const geminiProvider = {
  async sendMessage({ messages, context }) {
    const safeContext =
      context || createInitialAssistantContext();

    /*
     * IMPORTANTE:
     * A Assistente Crisostomo via Worker + Gemini é sempre a primeira opção.
     */

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);

    try {
      const response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          messages,
          catalog: publicCatalog,
          context: safeContext,
        }),

        signal: controller.signal,
      });

      const data = await readJson(response);

      /*
       * Se a API responder com erro, usamos o fallback técnico.
       */
      if (!response.ok) {
        console.error(
          "[Assistente Crisostomo] API respondeu com erro:",
          response.status,
          data
        );

        return makeFallback(
          messages,
          safeContext,
          true
        );
      }

      if (
        typeof data.reply !== "string" ||
        !data.reply.trim()
      ) {
        console.error(
          "[Assistente Crisostomo] API respondeu sem resposta válida:",
          data
        );

        return makeFallback(
          messages,
          safeContext,
          true
        );
      }

      const quickReplies = Array.isArray(data.quickReplies) && data.quickReplies.length > 0
        ? data.quickReplies
        : [
            "Ver outras opções",
            "Refinar minha busca",
            "Falar com Alyne",
          ];

      /*
       * Resposta produzida pela Assistente Crisostomo + Gemini.
       */
      return {
        text: data.reply.trim(),

        context: {
          ...safeContext,
          flow: "gemini",
          luxSearch: data.search || safeContext.luxSearch || null,
          whatsappMessage: data.whatsappMessage || safeContext.whatsappMessage || null,
          userPreferences: data.context?.userPreferences || safeContext.userPreferences || {},
        },

        quickReplies,

        nextState: LUX_STATES.LISTENING,

        completed: Boolean(data.completed),
      };
    } catch (error) {
      console.error(
        "[Assistente Crisostomo] Falha ao consultar a API:",
        error
      );

      return makeFallback(
        messages,
        safeContext,
        true
      );
    } finally {
      clearTimeout(timeout);
    }
  },
};
