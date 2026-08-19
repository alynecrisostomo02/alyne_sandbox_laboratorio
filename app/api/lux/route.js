import { env } from "cloudflare:workers";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1/interactions";
const GEMINI_MODEL = "gemini-3.6-flash";
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1200;
const MAX_REQUEST_BYTES = 18000;
const UPSTREAM_TIMEOUT = 20000;

const SYSTEM_INSTRUCTION = `Você é a Assistente Crisostomo, assistente imobiliária virtual da corretora Alyne Crisóstomo, em Redenção, Pará.
Responda em português do Brasil, com clareza, acolhimento e no máximo quatro frases curtas.
Não invente imóveis, preços, disponibilidade, documentos, financiamento ou características.
Para escolher imóveis, oriente a usar a Busca Guiada do site ou falar com Alyne.
Não prometa aprovação financeira nem dê parecer jurídico. Não solicite CPF, RG, telefone, dados bancários ou endereço completo.
Se a pergunta exigir confirmação profissional ou informação que você não possui, diga isso de forma direta e encaminhe para Alyne.
Não use markdown complexo e não afirme ser uma pessoa humana.`;

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

function requestOriginIsValid(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function clientIdentifier(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "local"
  );
}

function sanitizeMessages(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (message) =>
        (message?.role === "user" || message?.role === "assistant") &&
        message?.kind !== "summary" &&
        message?.id !== "assistant-0"
    )
    .map((message) => ({
      role: message.role,
      text: typeof message.text === "string"
        ? message.text.trim().slice(0, MAX_MESSAGE_LENGTH)
        : "",
    }))
    .filter((message) => message.text)
    .slice(-MAX_MESSAGES);
}

async function readBoundedJson(request) {
  if (!request.body) throw new Error("INVALID_JSON");

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bytesRead += value.byteLength;
      if (bytesRead > MAX_REQUEST_BYTES) throw new Error("REQUEST_TOO_LARGE");
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } finally {
    reader.releaseLock();
  }
}

function buildTranscript(messages) {
  return messages
    .map((message) => `${message.role === "user" ? "Visitante" : "Assistente Crisostomo"}: ${message.text}`)
    .join("\n\n");
}

function extractReply(payload) {
  const modelOutputs = Array.isArray(payload?.steps)
    ? payload.steps.filter((step) => step?.type === "model_output")
    : [];
  const lastOutput = modelOutputs.at(-1);

  return Array.isArray(lastOutput?.content)
    ? lastOutput.content
        .filter((part) => part?.type === "text" && typeof part.text === "string")
        .map((part) => part.text)
        .join("")
        .trim()
    : "";
}

export async function POST(request) {
  if (!requestOriginIsValid(request)) {
    return jsonResponse({ code: "ORIGIN_NOT_ALLOWED" }, 403);
  }

  if (!request.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
    return jsonResponse({ code: "UNSUPPORTED_CONTENT_TYPE" }, 415);
  }

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ code: "REQUEST_TOO_LARGE" }, 413);
  }

  const apiKey = typeof env.GEMINI_API_KEY === "string" ? env.GEMINI_API_KEY.trim() : "";
  if (!apiKey) {
    return jsonResponse({ code: "GEMINI_NOT_CONFIGURED" }, 503);
  }

  const rateLimit = await env.LUX_RATE_LIMITER.limit({
    key: `lux:${clientIdentifier(request)}`,
  });
  if (!rateLimit.success) {
    return jsonResponse({ code: "RATE_LIMITED" }, 429, { "Retry-After": "60" });
  }

  let body;
  try {
    body = await readBoundedJson(request);
  } catch (error) {
    return jsonResponse(
      { code: error?.message === "REQUEST_TOO_LARGE" ? "REQUEST_TOO_LARGE" : "INVALID_JSON" },
      error?.message === "REQUEST_TOO_LARGE" ? 413 : 400
    );
  }

  const messages = sanitizeMessages(body?.messages);
  if (!messages.length || messages.at(-1)?.role !== "user") {
    return jsonResponse({ code: "INVALID_MESSAGES" }, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);

  try {
    const upstream = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        input: buildTranscript(messages),
        system_instruction: SYSTEM_INSTRUCTION,
        store: false,
        generation_config: {
          max_output_tokens: 280,
          thinking_level: "minimal",
          thinking_summaries: "none",
        },
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const status = upstream.status === 429 ? 429 : 502;
      return jsonResponse(
        { code: upstream.status === 429 ? "GEMINI_RATE_LIMITED" : "GEMINI_UNAVAILABLE" },
        status,
        status === 429 ? { "Retry-After": upstream.headers.get("Retry-After") || "30" } : {}
      );
    }

    const payload = await upstream.json();
    const reply = extractReply(payload).slice(0, 1800);
    if (!reply) return jsonResponse({ code: "EMPTY_GEMINI_RESPONSE" }, 502);

    return jsonResponse({ reply });
  } catch (error) {
    return jsonResponse(
      { code: error?.name === "AbortError" ? "GEMINI_TIMEOUT" : "GEMINI_UNAVAILABLE" },
      502
    );
  } finally {
    clearTimeout(timeout);
  }
}
