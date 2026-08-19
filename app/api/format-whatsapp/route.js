import { env } from "cloudflare:workers";

const MAX_REQUEST_BYTES = 12000;
const MAX_TEXT = 120;
const MAX_NOTES = 1200;
const MAX_FEATURES = 12;
const UPSTREAM_TIMEOUT = 16000;
const DEFAULT_MODEL = "gemini-3.5-flash-lite";

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
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() || "local";
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

function cleanText(value, max = MAX_TEXT) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function sanitizeChoices(body) {
  const features = Array.isArray(body?.features)
    ? body.features.map((value) => cleanText(value, 80)).filter(Boolean).slice(0, MAX_FEATURES)
    : typeof body?.features === "string"
      ? [cleanText(body.features, 500)].filter(Boolean)
      : [];

  return {
    clientName: cleanText(body?.clientName),
    purpose: cleanText(body?.purpose) || "Comprar Imóvel",
    propertyType: cleanText(body?.propertyType) || "Casa Residencial",
    region: cleanText(body?.region) || "Redenção, PA",
    budget: cleanText(body?.budget),
    bedrooms: cleanText(body?.bedrooms),
    suites: cleanText(body?.suites),
    garage: cleanText(body?.garage),
    features,
    notes: cleanText(body?.notes, MAX_NOTES),
  };
}

function buildFallbackText(data) {
  const greeting = data.clientName
    ? `Olá, Alyne Crisóstomo! Meu nome é ${data.clientName} e preenchi a Busca Guiada no seu site.\n\n`
    : "Olá, Alyne Crisóstomo! Preenchi a Busca Guiada no seu site e gostaria de atendimento.\n\n";

  const lines = [
    "📋 *Perfil do Imóvel Solicitado:*",
    `• *Objetivo:* ${data.purpose}`,
    `• *Tipo:* ${data.propertyType}`,
    `• *Bairro / Região:* ${data.region}`,
    data.budget ? `• *Faixa de Orçamento:* ${data.budget}` : "",
    data.bedrooms ? `• *Quartos:* ${data.bedrooms}` : "",
    data.suites ? `• *Suítes:* ${data.suites}` : "",
    data.garage ? `• *Garagem:* ${data.garage}` : "",
    data.features.length ? `• *Diferenciais:* ${data.features.join(", ")}` : "",
    data.notes ? `\n📝 *Observações:*\n${data.notes}` : "",
    "\nPoderia verificar as opções disponíveis com esse perfil e me orientar no atendimento?",
  ].filter(Boolean);

  return `${greeting}${lines.join("\n")}`;
}

function buildPrompt(data) {
  return `Você é apenas um redator de resumo para a corretora Alyne Crisóstomo, em Redenção, Pará.\nO cliente já concluiu uma Busca Guiada. Sua única tarefa é organizar os dados abaixo em uma mensagem curta, natural e pronta para WhatsApp.\n\nDADOS DO CLIENTE:\n- Nome: ${data.clientName || "Não informado"}\n- Objetivo: ${data.purpose}\n- Tipo de imóvel: ${data.propertyType}\n- Bairro / região: ${data.region}\n- Orçamento: ${data.budget || "Não informado"}\n- Quartos: ${data.bedrooms || "Não informado"}\n- Suítes: ${data.suites || "Não informado"}\n- Garagem: ${data.garage || "Não informado"}\n- Diferenciais: ${data.features.join(", ") || "Nenhum específico"}\n- Observações: ${data.notes || "Nenhuma"}\n\nREGRAS OBRIGATÓRIAS:\n1. Não invente, complete, deduza ou altere nenhum dado.\n2. Não recomende imóveis, bairros, financiamento, valores ou condições.\n3. Comece cumprimentando a Alyne e diga que o cliente veio da Busca Guiada do site.\n4. Organize as preferências em tópicos legíveis usando *negrito* compatível com WhatsApp.\n5. Termine pedindo que Alyne verifique opções e dê continuidade ao atendimento.\n6. Retorne somente a mensagem final, sem explicações ou bloco de código.`;
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((part) => typeof part?.text === "string" ? part.text : "").join("").trim().slice(0, 3000);
}

export async function POST(request) {
  if (!requestOriginIsValid(request)) return jsonResponse({ ok: false, code: "ORIGIN_NOT_ALLOWED" }, 403);
  if (!request.headers.get("Content-Type")?.toLowerCase().includes("application/json")) return jsonResponse({ ok: false, code: "UNSUPPORTED_CONTENT_TYPE" }, 415);

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) return jsonResponse({ ok: false, code: "REQUEST_TOO_LARGE" }, 413);

  if (env.LUX_RATE_LIMITER?.limit) {
    const rateLimit = await env.LUX_RATE_LIMITER.limit({ key: `guided-whatsapp:${clientIdentifier(request)}` });
    if (!rateLimit.success) return jsonResponse({ ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": "60" });
  }

  let body;
  try {
    body = await readBoundedJson(request);
  } catch (error) {
    return jsonResponse({ ok: false, code: error?.message === "REQUEST_TOO_LARGE" ? "REQUEST_TOO_LARGE" : "INVALID_JSON" }, error?.message === "REQUEST_TOO_LARGE" ? 413 : 400);
  }

  const data = sanitizeChoices(body);
  const fallback = buildFallbackText(data);
  const apiKey = typeof env.GEMINI_API_KEY === "string" ? env.GEMINI_API_KEY.trim() : "";
  if (!apiKey) return jsonResponse({ ok: true, message: fallback, source: "fallback" });

  const model = typeof env.GEMINI_MODEL === "string" && env.GEMINI_MODEL.trim() ? env.GEMINI_MODEL.trim() : DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);

  try {
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(data) }] }],
        generationConfig: { temperature: 0.25, maxOutputTokens: 600 },
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      return jsonResponse({ ok: true, message: fallback, source: "fallback", upstream: upstream.status === 429 ? "rate_limited" : "unavailable" });
    }

    const payload = await upstream.json();
    const text = extractGeminiText(payload);
    return jsonResponse({ ok: true, message: text || fallback, source: text ? "gemini" : "fallback" });
  } catch (error) {
    return jsonResponse({ ok: true, message: fallback, source: "fallback", upstream: error?.name === "AbortError" ? "timeout" : "unavailable" });
  } finally {
    clearTimeout(timeout);
  }
}
