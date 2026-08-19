/**
 * LUX API WORKER - VERSION 5
 * Identity: interactions-v5-smart-catalog
 *
 * Backend inteligente para a assistente Lux da Alyne Crisóstomo Imóveis.
 * Realiza pré-filtragem determinística do catálogo antes de enviar candidatos ao Gemini.
 */

export function createInitialPreferences() {
  return {
    purpose: null,               // "venda" | "locacao"
    type: null,                  // "casa" | "apartamento" | "terreno" | "sala comercial" | etc.
    maxPrice: null,              // number
    minDormitories: null,        // number
    minSuites: null,             // number
    neighborhood: null,          // string
    condominiumPreference: null, // true | false | null
    requiredFeatures: [],        // string[]
    desiredFeatures: [],         // string[]
    specificRef: null,           // string (ex: "REF-029")
  };
}

export function normalizeText(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function parsePrice(text) {
  if (!text) return null;
  const norm = normalizeText(text);

  // Exemplo: "1,2 milhão", "1.5 milhao", "2 milhoes"
  const millionMatch = norm.match(/(\d+(?:[.,]\d+)?)\s*milh[oõ]es?/i);
  if (millionMatch) {
    const val = parseFloat(millionMatch[1].replace(",", "."));
    if (!isNaN(val)) return Math.round(val * 1000000);
  }

  // Exemplo: "500 mil", "500k"
  const thousandMatch = norm.match(/(\d+(?:[.,]\d+)?)\s*(?:mil|k)\b/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1].replace(",", "."));
    if (!isNaN(val)) return Math.round(val * 1000);
  }

  // Exemplo: "R$ 500.000", "500000", "500.000,00"
  const digitsOnly = norm.replace(/[^\d.,]/g, "");
  if (digitsOnly) {
    let clean = digitsOnly;
    if (clean.includes(",") && clean.includes(".")) {
      clean = clean.replace(/\./g, "").replace(",", ".");
    } else if (clean.includes(",")) {
      clean = clean.replace(",", ".");
    } else if ((clean.match(/\./g) || []).length > 1) {
      clean = clean.replace(/\./g, "");
    }
    const val = parseFloat(clean);
    if (!isNaN(val) && val > 1000) return Math.round(val);
  }

  return null;
}

export function parsePurpose(text) {
  const norm = normalizeText(text);
  if (/\b(?:comprar|compra|venda|a venda|para venda|aquisi[cç][aã]o)\b/.test(norm)) {
    return "venda";
  }
  if (/\b(?:alugar|aluguel|loca[cç][aã]o|locar|para alugar)\b/.test(norm)) {
    return "locacao";
  }
  return null;
}

export function parsePropertyType(text) {
  const norm = normalizeText(text);
  if (/\b(?:casa|casas|residencia|sobrado)\b/.test(norm)) {
    return "casa";
  }
  if (/\b(?:apartamento|apartamentos|apto|aptos|ap)\b/.test(norm)) {
    return "apartamento";
  }
  if (/\b(?:terreno|terrenos|lote|lotes|loteamento)\b/.test(norm)) {
    return "terreno";
  }
  if (/\b(?:sala commercial|sala|salas|comercial|ponto comercial|loja|galpao)\b/.test(norm)) {
    return "sala comercial";
  }
  return null;
}

export function parseRef(text) {
  if (!text) return null;
  const match = text.match(/\bref[-_\s]*0*(\d{1,4})\b/i);
  if (match) {
    const num = match[1].padStart(3, "0");
    return `REF-${num}`;
  }
  return null;
}

export function parseFeatureName(rawName) {
  const norm = normalizeText(rawName);
  if (norm.includes("piscina")) return "piscina";
  if (norm.includes("churrasqueira") || norm.includes("churras")) return "churrasqueira";
  if (norm.includes("energia solar") || norm.includes("placa solar") || norm.includes("painel solar")) return "energia solar";
  if (norm.includes("planejado") || norm.includes("armario")) return "planejados";
  if (norm.includes("mobiliado") || norm.includes("mobilia")) return "mobiliado";
  if (norm.includes("garagem") || norm.includes("vaga")) return "garagem";
  if (norm.includes("gourmet")) return "espaço gourmet";
  return norm;
}

export function updatePreferences(currentPreferences = {}, messageText = "") {
  const prefs = {
    ...createInitialPreferences(),
    ...(currentPreferences || {}),
    requiredFeatures: Array.isArray(currentPreferences?.requiredFeatures)
      ? [...currentPreferences.requiredFeatures]
      : [],
    desiredFeatures: Array.isArray(currentPreferences?.desiredFeatures)
      ? [...currentPreferences.desiredFeatures]
      : [],
  };

  if (!messageText || typeof messageText !== "string") return prefs;

  const norm = normalizeText(messageText);

  // 1. REF Específica
  const foundRef = parseRef(messageText);
  if (foundRef) {
    prefs.specificRef = foundRef;
  }

  // 2. Finalidade (Purpose) - Critério Rígido
  const newPurpose = parsePurpose(messageText);
  if (newPurpose) {
    prefs.purpose = newPurpose;
  }

  // 3. Tipo do Imóvel (Type) - Critério Rígido
  const newType = parsePropertyType(messageText);
  if (newType) {
    prefs.type = newType;
  }

  // 4. Orçamento Máximo (Preço)
  const isCorrection = /(?:na verdade|pensando melhor|pode ser ate|aumenta para|diminui para|mudei de ideia|ate r\$|ate|orcamento de)/i.test(norm);
  const foundPrice = parsePrice(messageText);
  if (foundPrice) {
    if (isCorrection || !prefs.maxPrice || norm.includes("ate") || norm.includes("maximo")) {
      prefs.maxPrice = foundPrice;
    }
  }

  // 5. Dormitórios e Suítes
  const bedroomsMatch = norm.match(/(\d+)\s*(?:quartos?|dormitorios?|dorms?|dorm?)\b/);
  if (bedroomsMatch) {
    prefs.minDormitories = parseInt(bedroomsMatch[1], 10);
  }

  const suitesMatch = norm.match(/(\d+)\s*su[ií]tes?\b/);
  if (suitesMatch) {
    prefs.minSuites = parseInt(suitesMatch[1], 10);
  }

  // Remoção de exigência de suítes
  if (/(?:nao precisa|sem|esquece)\s+(?:ser\s+)?(?:\d+\s+)?su[ií]tes?/i.test(norm)) {
    prefs.minSuites = null;
  }

  // 6. Condomínio
  if (/(?:em condom[ií]nio|condom[ií]nio fechado|com condom[ií]nio)/i.test(norm)) {
    prefs.condominiumPreference = true;
  } else if (/(?:fora de condom[ií]nio|sem condom[ií]nio|nao quero condom[ií]nio)/i.test(norm)) {
    prefs.condominiumPreference = false;
  } else if (/(?:tanto faz|com ou sem)\s+(?:o\s+)?condom[ií]nio/i.test(norm)) {
    prefs.condominiumPreference = null;
  }

  // 7. Bairro
  if (/(?:tanto faz|qualquer)\s+(?:o\s+)?bairro/i.test(norm)) {
    prefs.neighborhood = null;
  } else {
    const neighborhoodMatch = norm.match(/(?:no|em|bairro|regiao|na)\s+([a-z0-9\s]+?)(?:[.,;]|$)/i);
    if (neighborhoodMatch) {
      const candidate = neighborhoodMatch[1].trim();
      if (candidate.length > 2 && !["venda", "locacao", "casa", "apartamento", "condominio"].includes(candidate)) {
        prefs.neighborhood = candidate;
      }
    }
  }

  // 8. Features (Piscina, churrasqueira, etc.)
  const knownFeaturesList = ["piscina", "churrasqueira", "energia solar", "planejados", "mobiliado", "garagem", "espaço gourmet"];

  for (const feat of knownFeaturesList) {
    const featNorm = normalizeText(feat);
    if (norm.includes(featNorm)) {
      const isRemoval = new RegExp(`(?:nao precisa|esquece|sem|tirar|dispensam?)\\s+(?:de\\s+)?${featNorm}`, "i").test(norm);
      if (isRemoval) {
        prefs.requiredFeatures = prefs.requiredFeatures.filter((f) => parseFeatureName(f) !== featNorm);
        prefs.desiredFeatures = prefs.desiredFeatures.filter((f) => parseFeatureName(f) !== featNorm);
      } else if (/(?:tem que ter|obrigatorio|exijo|preciso de)/i.test(norm)) {
        if (!prefs.requiredFeatures.some((f) => parseFeatureName(f) === featNorm)) {
          prefs.requiredFeatures.push(feat);
        }
      } else {
        if (!prefs.requiredFeatures.some((f) => parseFeatureName(f) === featNorm)) {
          prefs.requiredFeatures.push(feat);
        }
      }
    }
  }

  return prefs;
}

export function propertyHasFeature(property, featureName) {
  if (!property) return false;
  const target = parseFeatureName(featureName);

  const searchPool = [
    ...(Array.isArray(property.features) ? property.features : []),
    ...(Array.isArray(property.amenities) ? property.amenities : []),
    property.shortDescription || "",
    property.title || "",
    property.furnished ? "mobiliado" : "",
    property.parking ? `${property.parking} vagas garagem` : "",
  ].map(normalizeText);

  return searchPool.some((text) => text.includes(target));
}

/**
 * REGRA ABSOLUTA:
 * null / undefined / ausente significam NÃO CONFIRMADO.
 * Se um critério obrigatório não puder ser confirmado, NÃO É EXACT MATCH.
 */
export function matchesHardCriteria(property, preferences) {
  if (!property || !preferences) return false;

  // Status "Indisponível" nunca entra
  if (property.status === "Indisponível") return false;

  // 1. Finalidade (RIGIDO)
  if (preferences.purpose) {
    if (!property.purpose || normalizeText(property.purpose) !== normalizeText(preferences.purpose)) {
      return false;
    }
  }

  // 2. Tipo de Imóvel (RIGIDO)
  if (preferences.type) {
    if (!property.type || normalizeText(property.type) !== normalizeText(preferences.type)) {
      return false;
    }
  }

  // 3. Orçamento Máximo (Preço)
  if (preferences.maxPrice !== null && preferences.maxPrice !== undefined) {
    if (property.price === null || property.price === undefined || property.priceOnRequest === true) {
      return false; // NÃO CONFIRMADO => NÃO É EXATO
    }
    if (typeof property.price === "number" && property.price > preferences.maxPrice) {
      return false;
    }
  }

  // 4. Dormitórios e Suítes
  if (preferences.minDormitories !== null && preferences.minDormitories !== undefined) {
    const bedrooms = typeof property.bedrooms === "number" ? property.bedrooms : null;
    const suites = typeof property.suites === "number" ? property.suites : 0;
    
    if (bedrooms === null) {
      return false; // NÃO CONFIRMADO => NÃO É EXATO
    }
    const totalDormitories = bedrooms + suites;
    if (totalDormitories < preferences.minDormitories) {
      return false;
    }
  }

  if (preferences.minSuites !== null && preferences.minSuites !== undefined) {
    if (property.suites === null || property.suites === undefined) {
      return false; // NÃO CONFIRMADO => NÃO É EXATO
    }
    if (property.suites < preferences.minSuites) {
      return false;
    }
  }

  // 5. Condomínio
  if (preferences.condominiumPreference === true) {
    const isCondo = (property.condominiumFee && property.condominiumFee > 0) ||
      propertyHasFeature(property, "condominio");
    if (!isCondo) return false;
  } else if (preferences.condominiumPreference === false) {
    const isCondo = (property.condominiumFee && property.condominiumFee > 0) ||
      propertyHasFeature(property, "condominio");
    if (isCondo) return false;
  }

  // 6. Features Obrigatórias
  if (Array.isArray(preferences.requiredFeatures) && preferences.requiredFeatures.length > 0) {
    for (const reqFeat of preferences.requiredFeatures) {
      if (!propertyHasFeature(property, reqFeat)) {
        return false; // Feature não confirmada => NÃO É EXATO
      }
    }
  }

  return true;
}

/**
 * SELEÇÃO DE ALTERNATIVAS SEGURAS
 * Regras rígidas mantidas: purpose e type explicitamente definidos NUNCA trocam em alternativas!
 */
export function selectAlternatives(catalog = [], preferences = {}, exactMatches = []) {
  if (!Array.isArray(catalog)) return [];
  const exactIds = new Set(exactMatches.map((m) => m.id));

  const candidates = catalog.filter((prop) => {
    if (!prop || exactIds.has(prop.id)) return false;
    if (prop.status === "Indisponível") return false;

    // RIGIDO: Purpose não pode divergir em alternativa se definido!
    if (preferences.purpose && prop.purpose && normalizeText(prop.purpose) !== normalizeText(preferences.purpose)) {
      return false;
    }

    // RIGIDO: Type não pode divergir em alternativa se definido!
    if (preferences.type && prop.type && normalizeText(prop.type) !== normalizeText(preferences.type)) {
      return false;
    }

    return true;
  });

  const scored = candidates.map((prop) => {
    const differences = [];
    let scorePenalty = 0;

    // Divergência de Preço
    if (preferences.maxPrice && typeof prop.price === "number") {
      if (prop.price > preferences.maxPrice) {
        const ratio = prop.price / preferences.maxPrice;
        if (ratio > 1.35) {
          scorePenalty += 100; // Preço excessivamente alto
        } else {
          scorePenalty += Math.round((ratio - 1) * 40);
          differences.push(`Valor de R$ ${prop.price.toLocaleString("pt-BR")} (acima do orçamento inicial de R$ ${preferences.maxPrice.toLocaleString("pt-BR")})`);
        }
      }
    } else if (preferences.maxPrice && (prop.price === null || prop.priceOnRequest)) {
      scorePenalty += 15;
      differences.push("Valor sob consulta (necessita confirmação de preço com Alyne)");
    }

    // Status "Disponibilidade sob consulta"
    if (prop.status === "Disponibilidade sob consulta") {
      scorePenalty += 10;
      differences.push("Disponibilidade sob consulta com Alyne");
    }

    // Divergência de Features Obrigatórias
    if (Array.isArray(preferences.requiredFeatures)) {
      for (const feat of preferences.requiredFeatures) {
        if (!propertyHasFeature(prop, feat)) {
          scorePenalty += 20;
          differences.push(`Não há confirmação de ${feat}`);
        }
      }
    }

    // Divergência de Bairro
    if (preferences.neighborhood && prop.neighborhood) {
      if (!normalizeText(prop.neighborhood).includes(normalizeText(preferences.neighborhood))) {
        scorePenalty += 10;
        differences.push(`Localizado no bairro ${prop.neighborhood}`);
      }
    }

    return {
      property: {
        id: prop.id,
        idRef: prop.idRef,
        title: prop.title,
        purpose: prop.purpose,
        type: prop.type,
        price: prop.price,
        priceOnRequest: prop.priceOnRequest,
        neighborhood: prop.neighborhood,
        bedrooms: prop.bedrooms,
        suites: prop.suites,
        status: prop.status,
      },
      scorePenalty,
      differences,
    };
  });

  return scored
    .filter((item) => item.scorePenalty < 80)
    .sort((a, b) => a.scorePenalty - b.scorePenalty)
    .slice(0, 3);
}

export function generateQuickReplies(exactMatches = [], alternatives = [], specificRefProperty = null) {
  if (specificRefProperty) {
    return [
      `Quero falar sobre a ${specificRefProperty.idRef}`,
      "Ver outras opções",
      "Falar com Alyne",
    ];
  }

  if (exactMatches.length > 0) {
    return [
      "Ver detalhes dos imóveis",
      "Refinar minha busca",
      "Falar com Alyne",
    ];
  }

  if (alternatives.length > 0) {
    return [
      "Ver alternativas",
      "Alterar minha busca",
      "Falar com Alyne",
    ];
  }

  return [
    "Alterar orçamento",
    "Mudar critérios",
    "Falar com Alyne",
  ];
}

export function buildWhatsAppMessage(preferences = {}, specificRefProperty = null) {
  const lines = ["Olá, Alyne. Conversei com a Lux no site."];
  const parts = [];

  if (preferences.purpose) {
    parts.push(preferences.purpose === "venda" ? "compra" : "locação");
  }

  if (preferences.type) {
    parts.push(`de ${preferences.type}`);
  }

  if (preferences.maxPrice) {
    parts.push(`até R$ ${preferences.maxPrice.toLocaleString("pt-BR")}`);
  }

  if (preferences.minDormitories) {
    parts.push(`com pelo menos ${preferences.minDormitories} quarto(s)`);
  }

  if (parts.length > 0) {
    lines.push(`Busco um imóvel para ${parts.join(" ")}.`);
  }

  if (specificRefProperty) {
    lines.push(`Gostaria de confirmar a disponibilidade da ${specificRefProperty.idRef}.`);
  }

  return lines.join("\n");
}

export function buildSystemInstruction() {
  return `Você é Lux, a assistente virtual oficial da corretora Alyne Crisóstomo em Redenção, Pará.
Sua missão é responder com elegância, clareza, empatia e objetividade.

REGRAS RÍGIDAS DE VERACIDADE:
1. Use SOMENTE os imóveis fornecidos no contexto desta requisição. NUNCA invente imóveis, preços, características ou disponibilidades.
2. 'null' significa informação NÃO CONFIRMADA. Se o preço for null ou sob consulta, avise que depende de confirmação com a Alyne.
3. Sempre cite o código de referência (ex: REF-029) ao mencionar um imóvel.
4. Se houver correspondências exatas, apresente-as com destaque.
5. Se não houver correspondências exatas mas houver alternativas, explique com transparência o que diverge (ex: valor um pouco acima ou bairro diferente).
6. Se o status for 'Disponibilidade sob consulta', informe que o imóvel precisa de confirmação direta com a Alyne.
7. NUNCA utilize frases apelativas de vendas como 'oportunidade imperdível', 'investimento garantido' ou 'imóvel perfeito'.
8. Nunca solicite CPF, RG, dados bancários ou endereço residencial completo.
9. Responda em no máximo 4 frases curtas e acolhedoras em Português do Brasil.`;
}

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "GET") {
      return Response.json(
        {
          ok: true,
          service: "lux-api",
          version: "interactions-v5-smart-catalog",
          message: "Lux API funcionando com busca inteligente no catálogo.",
        },
        { headers: corsHeaders }
      );
    }

    if (request.method !== "POST") {
      return Response.json({ code: "METHOD_NOT_ALLOWED" }, { status: 405, headers: corsHeaders });
    }

    if (env?.LUX_RATE_LIMITER && typeof env.LUX_RATE_LIMITER.limit === "function") {
      try {
        const clientIp = request.headers.get("CF-Connecting-IP") || "anon";
        const limitRes = await env.LUX_RATE_LIMITER.limit({ key: `lux:${clientIp}` });
        if (limitRes && !limitRes.success) {
          return Response.json({ code: "RATE_LIMITED" }, { status: 429, headers: corsHeaders });
        }
      } catch {
        // Safe fallback if rate limiter fails
      }
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ code: "INVALID_JSON" }, { status: 400, headers: corsHeaders });
    }

    const messages = Array.isArray(payload?.messages)
      ? payload.messages
      : payload?.message
      ? [{ role: "user", text: payload.message }]
      : [];

    const catalog = Array.isArray(payload?.catalog) ? payload.catalog : [];
    const lastUserMessage = messages.filter((m) => m.role === "user").at(-1)?.text || "";
    const incomingContext = payload?.context || {};

    const updatedPreferences = updatePreferences(incomingContext.userPreferences, lastUserMessage);

    let specificRefProperty = null;
    if (updatedPreferences.specificRef) {
      specificRefProperty = catalog.find(
        (p) => p.idRef === updatedPreferences.specificRef || normalizeText(p.slug).includes(normalizeText(updatedPreferences.specificRef))
      ) || null;
    }

    const exactMatches = catalog.filter((prop) => matchesHardCriteria(prop, updatedPreferences));
    const alternatives = selectAlternatives(catalog, updatedPreferences, exactMatches);

    const quickReplies = generateQuickReplies(exactMatches, alternatives, specificRefProperty);
    const whatsappMessage = buildWhatsAppMessage(updatedPreferences, specificRefProperty);

    const candidatesForAI = [];

    if (specificRefProperty) {
      candidatesForAI.push({ ...specificRefProperty, candidateRole: "especifico_solicitado" });
    }

    for (const match of exactMatches.slice(0, 3)) {
      if (!candidatesForAI.some((c) => c.id === match.id)) {
        candidatesForAI.push({ ...match, candidateRole: "correspondencia_exata" });
      }
    }

    for (const alt of alternatives) {
      if (!candidatesForAI.some((c) => c.id === alt.property.id)) {
        candidatesForAI.push({
          ...alt.property,
          candidateRole: "alternativa_segura",
          divergencias: alt.differences,
        });
      }
    }

    const catalogItemsReceived = catalog.length;
    const catalogItemsSentToAI = candidatesForAI.length;

    const apiKey = typeof env?.GEMINI_API_KEY === "string" ? env.GEMINI_API_KEY.trim() : "";
    let replyText = "";

    if (apiKey) {
      const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/interactions";
      const transcript = messages.map((m) => `${m.role === "user" ? "Visitante" : "Lux"}: ${m.text}`).join("\n");
      const promptInput = `HISTÓRICO DA CONVERSA:\n${transcript}\n\nPREFERÊNCIAS CONFIRMADAS:\n${JSON.stringify(updatedPreferences, null, 2)}\n\nCANDIDATOS ELEGÍVEIS AVALIADOS:\n${JSON.stringify(candidatesForAI, null, 2)}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      try {
        const upstream = await fetch(geminiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            model: "gemini-3.5-flash",
            input: promptInput,
            system_instruction: buildSystemInstruction(),
            store: false,
            generation_config: {
              max_output_tokens: 350,
              thinking_level: "minimal",
            },
          }),
          signal: controller.signal,
        });

        if (upstream.ok) {
          const geminiRes = await upstream.json();
          const modelOutputs = Array.isArray(geminiRes?.steps)
            ? geminiRes.steps.filter((s) => s?.type === "model_output")
            : [];
          const lastOutput = modelOutputs.at(-1);

          if (Array.isArray(lastOutput?.content)) {
            replyText = lastOutput.content
              .filter((p) => p?.type === "text" && typeof p.text === "string")
              .map((p) => p.text)
              .join("")
              .trim();
          }
        }
      } catch (err) {
        console.error("[Lux-Worker] Erro na consulta Gemini:", err);
      } finally {
        clearTimeout(timeout);
      }
    }

    if (!replyText) {
      if (specificRefProperty) {
        replyText = `Localizei o imóvel ${specificRefProperty.idRef} (${specificRefProperty.title}). ${specificRefProperty.status === "Disponibilidade sob consulta" ? "A disponibilidade precisa ser confirmada diretamente com a Alyne." : "Está disponível para atendimento."}`;
      } else if (exactMatches.length > 0) {
        replyText = `Encontrei ${exactMatches.length} imóvel(is) que atende(m) exatamente ao seu pedido. O que gostaria de saber primeiro?`;
      } else if (alternatives.length > 0) {
        replyText = `Não encontrei um imóvel com correspondência exata para a sua busca, mas selecionei ${alternatives.length} alternativa(s) próxima(s) para você avaliar.`;
      } else {
        replyText = "Não encontrei um imóvel com esses critérios no catálogo atual. Posso encaminhar você para a Alyne verificar outras opções.";
      }
    }

    return Response.json(
      {
        reply: replyText,
        quickReplies,
        context: {
          ...incomingContext,
          flow: "gemini",
          userPreferences: updatedPreferences,
        },
        search: {
          criteria: updatedPreferences,
          exactMatches: exactMatches.map((m) => ({ id: m.id, idRef: m.idRef, title: m.title, price: m.price })),
          alternatives,
        },
        whatsappMessage,
        catalogItemsReceived,
        catalogItemsSentToAI,
        model: "gemini-3.5-flash",
        id: `lux-${Date.now()}`,
      },
      { headers: corsHeaders }
    );
  },
};
