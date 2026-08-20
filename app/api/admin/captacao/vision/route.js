import { env } from "cloudflare:workers";
import { GoogleGenAI } from "@google/genai";
import { isAuthenticated, json, readJson, sameOrigin } from "@/src/admin/server";

function getGeminiApiKey() {
  let key = "";
  try {
    if (typeof env !== "undefined" && env && env.GEMINI_API_KEY) {
      key = env.GEMINI_API_KEY;
    }
  } catch {}
  if (!key) {
    try {
      if (typeof process !== "undefined" && process?.env && process.env.GEMINI_API_KEY) {
        key = process.env.GEMINI_API_KEY;
      }
    } catch {}
  }
  return String(key || "").trim();
}

const FREE_VISION_MODELS = [
  "gemini-3.7-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash",
];

const VISION_SYSTEM_INSTRUCTION = `Você é o Especialista em Inteligência Imobiliária e OCR Vision da imobiliária Alyne Crisóstomo (Redenção/PA).
Sua missão é analisar imagens de fichas de captação de imóveis (fotos de formulários em papel, prints de conversas do WhatsApp, anúncios de portais, flyers ou anotações manuscritas) e extrair os dados cadastrais com máxima fidelidade.

Você DEVE responder ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "propertyType": "Casa" | "Apartamento" | "Terreno" | "Comercial" | "Chácara" | "Fazenda" | "Outro" | "",
  "purpose": "Venda" | "Locação" | "Venda ou locação" | "",
  "owner": "Nome do proprietário ou cliente (se houver)",
  "phone": "Telefone com DDD no formato (XX) XXXXX-XXXX ou números brutos",
  "neighborhood": "Bairro identificado (ex: Park dos Buritis, Centro, etc)",
  "condominium": "Nome do condomínio ou edifício se aplicável",
  "address": "Endereço, rua, quadra, lote, número",
  "bedrooms": "quantidade de quartos em número inteiro (ex: '3') ou ''",
  "suites": "quantidade de suítes em número inteiro (ex: '1') ou ''",
  "bathrooms": "quantidade de banheiros em número inteiro (ex: '2') ou ''",
  "parkingSpaces": "quantidade de vagas de garagem (ex: '2') ou ''",
  "builtArea": "área construída em m² apenas número (ex: '180') ou ''",
  "landArea": "área do terreno em m² apenas número (ex: '300') ou ''",
  "differentials": {
    "Piscina": true | false | null,
    "Energia solar": true | false | null,
    "Planejados": true | false | null,
    "Poço artesiano": true | false | null,
    "Churrasqueira": true | false | null
  },
  "notes": "Observações completas, valores de venda/locação/condomínio, detalhes de acabamento, mobília e condições de pagamento mencionadas"
}

Regras:
1. Responda APENAS o JSON puro, sem markdown adicional ou blocos \`\`\`json.
2. Se algum campo numérico ou diferencial não for citado na imagem, deixe em branco ("") ou null.
3. Se houver valores monetários (ex: R$ 650.000), mencione claramente no campo "notes".
4. Mantenha os nomes das cidades ou bairros fiéis à imagem.`;

export async function POST(request) {
  if (!sameOrigin(request)) {
    return json({ code: "ORIGIN_NOT_ALLOWED" }, 403);
  }

  if (!(await isAuthenticated(request))) {
    return json({ code: "UNAUTHORIZED" }, 401);
  }

  try {
    const body = await readJson(request, 8_000_000); // Suporta até 8MB
    const { imageBase64, mimeType = "image/jpeg", promptCustom } = body || {};

    if (!imageBase64) {
      return json({ code: "NO_IMAGE_PROVIDED", message: "Nenhuma imagem foi enviada." }, 400);
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return json({
        code: "API_KEY_REQUIRED",
        message: "Chave GEMINI_API_KEY não configurada no ambiente. Adicione a chave nas variáveis do projeto para usar a leitura por IA gratuita.",
      }, 400);
    }

    // Remove prefixo base64 se presente (data:image/png;base64,...)
    const cleanBase64 = String(imageBase64).replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const userPrompt = promptCustom || "Analise com atenção todos os textos e campos desta ficha/foto de imóvel e extraia os dados estruturados no formato JSON.";

    let lastError = null;
    let extractedData = null;
    let modelUsed = "";

    for (const modelName of FREE_VISION_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || "image/jpeg",
              },
            },
            userPrompt,
          ],
          config: {
            systemInstruction: VISION_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text;
        if (rawText) {
          try {
            extractedData = JSON.parse(rawText);
          } catch {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              extractedData = JSON.parse(jsonMatch[0]);
            }
          }

          if (extractedData) {
            modelUsed = modelName;
            break;
          }
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Captacao Vision AI] Falha no modelo gratuito ${modelName}:`, err?.message);
      }
    }

    if (!extractedData) {
      throw lastError || new Error("Não foi possível extrair dados da imagem.");
    }

    // Normalização dos diferenciais e campos
    const formattedResult = {
      form: {
        propertyType: extractedData.propertyType || "",
        purpose: extractedData.purpose || "",
        owner: extractedData.owner || "",
        phone: extractedData.phone || "",
        neighborhood: extractedData.neighborhood || "",
        condominium: extractedData.condominium || "",
        address: extractedData.address || "",
        bedrooms: extractedData.bedrooms != null ? String(extractedData.bedrooms) : "",
        suites: extractedData.suites != null ? String(extractedData.suites) : "",
        bathrooms: extractedData.bathrooms != null ? String(extractedData.bathrooms) : "",
        parkingSpaces: extractedData.parkingSpaces != null ? String(extractedData.parkingSpaces) : "",
        builtArea: extractedData.builtArea != null ? String(extractedData.builtArea) : "",
        landArea: extractedData.landArea != null ? String(extractedData.landArea) : "",
        notes: extractedData.notes || "",
      },
      differentials: extractedData.differentials || {},
    };

    return json({
      success: true,
      data: formattedResult,
      modelUsed,
    });
  } catch (error) {
    console.error("[Captacao Vision API Error]:", error?.message);
    return json({
      code: "VISION_EXTRACTION_FAILED",
      message: error?.message || "Erro ao processar a imagem com o Gemini.",
    }, 500);
  }
}
