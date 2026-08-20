import JSZip from "jszip";

const PROTECTED_SYSTEM_PATHS = [
  { path: "src/admin/server.js", risk: "critical", reason: "Arquivo central de autenticação e banco de dados do Admin." },
  { path: "app/api/admin/session/route.js", risk: "critical", reason: "Controle de sessão e login administrativo." },
  { path: "app/api/admin/properties/route.js", risk: "high", reason: "Gerenciamento de imóveis e persistência." },
  { path: "src/properties.js", risk: "high", reason: "Base de dados canônica do catálogo imobiliário." },
  { path: "app/globals.css", risk: "medium", reason: "Estilos globais da identidade visual Jardim Botânico." },
  { path: "wrangler.jsonc", risk: "critical", reason: "Configurações de infraestrutura e segredos do Cloudflare." },
  { path: "package.json", risk: "medium", reason: "Manifesto de dependências do projeto." }
];

export async function analyzeZipPackage(fileOrBuffer, originalFileName = "pacote-ai-studio.zip") {
  const zip = new JSZip();
  let loadedZip;
  
  try {
    loadedZip = await zip.loadAsync(fileOrBuffer);
  } catch (error) {
    throw new Error("O arquivo selecionado não é um arquivo ZIP válido ou está corrompido.");
  }

  const entries = Object.entries(loadedZip.files).filter(([, entry]) => !entry.dir && !entry.name.startsWith("__MACOSX") && !entry.name.includes(".DS_Store"));
  
  if (entries.length === 0) {
    throw new Error("O arquivo ZIP está vazio ou não contém arquivos utilizáveis.");
  }

  const files = [];
  let packageJsonData = null;
  let metadataJsonData = null;
  const envSet = new Set();
  const apiEndpoints = [];
  const conflicts = [];
  let highestRisk = "low";

  for (const [relativePath, zipEntry] of entries) {
    const cleanPath = relativePath.replace(/^\.\//, "").replace(/^\/+/, "");
    const ext = cleanPath.split(".").pop()?.toLowerCase() || "";
    let type = "other";

    if (cleanPath.startsWith("src/components/") || cleanPath.startsWith("components/") || ext === "jsx" || ext === "tsx") {
      type = "component";
    } else if (cleanPath.startsWith("app/api/") || cleanPath.startsWith("src/api/") || cleanPath.includes("/api/")) {
      type = "api";
    } else if (cleanPath.startsWith("app/") || cleanPath.startsWith("pages/")) {
      type = "page";
    } else if (cleanPath.startsWith("migrations/") || cleanPath.endsWith(".sql")) {
      type = "migration";
    } else if (["css", "scss"].includes(ext)) {
      type = "style";
    } else if (["png", "jpg", "jpeg", "webp", "svg", "gif"].includes(ext)) {
      type = "asset";
    } else if (["json", "js", "ts", "mjs"].includes(ext)) {
      type = "config";
    } else if (["md", "txt"].includes(ext)) {
      type = "doc";
    }

    let isText = ["js", "jsx", "ts", "tsx", "json", "css", "html", "md", "txt", "sql", "mjs"].includes(ext);
    let textContent = "";

    if (isText) {
      try {
        textContent = await zipEntry.async("string");
        
        // Scan for environment variables
        const envMatches = textContent.matchAll(/(?:process\.env\.|import\.meta\.env\.)([A-Z0-9_]+)/g);
        for (const match of envMatches) {
          if (match[1] && !["NODE_ENV", "PORT"].includes(match[1])) {
            envSet.add(match[1]);
          }
        }

        // Check if package.json
        if (cleanPath === "package.json" || cleanPath.endsWith("/package.json")) {
          try {
            packageJsonData = JSON.parse(textContent);
          } catch {}
        }

        // Check if metadata.json
        if (cleanPath === "metadata.json" || cleanPath.endsWith("/metadata.json")) {
          try {
            metadataJsonData = JSON.parse(textContent);
          } catch {}
        }
      } catch {
        isText = false;
      }
    }

    // Determine status (new or modified)
    const protectedMatch = PROTECTED_SYSTEM_PATHS.find((p) => p.path === cleanPath || cleanPath.endsWith(p.path));
    let status = "new";
    let conflictRisk = null;
    let conflictReason = null;

    if (protectedMatch) {
      status = "conflict";
      conflictRisk = protectedMatch.risk;
      conflictReason = protectedMatch.reason;
      conflicts.push({
        path: cleanPath,
        risk: protectedMatch.risk,
        reason: protectedMatch.reason
      });

      if (protectedMatch.risk === "critical") highestRisk = "high";
      else if (protectedMatch.risk === "high" && highestRisk !== "high") highestRisk = "high";
      else if (protectedMatch.risk === "medium" && highestRisk === "low") highestRisk = "medium";
    }

    if (type === "api") {
      const endpoint = "/" + cleanPath.replace(/^app\//, "").replace(/\/route\.[jt]sx?$/, "");
      apiEndpoints.push(endpoint);
    }

    files.push({
      path: cleanPath,
      type,
      size: zipEntry._data?.uncompressedSize || textContent.length || 1024,
      status,
      conflictRisk,
      conflictReason,
      content: textContent || null
    });
  }

  // Derive title, description, category
  let name = metadataJsonData?.name || packageJsonData?.name || originalFileName.replace(/\.zip$/i, "").replace(/[-_]/g, " ");
  name = name.charAt(0).toUpperCase() + name.slice(1);
  const description = metadataJsonData?.description || packageJsonData?.description || `Módulo importado de ${originalFileName} contendo ${files.length} arquivos.`;
  const dependencies = packageJsonData?.dependencies || {};

  return {
    id: `mod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    version: packageJsonData?.version || metadataJsonData?.version || "1.0.0",
    description,
    author: packageJsonData?.author || metadataJsonData?.author || "Importado via AI Studio",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "testing", // Default to testing on import
    riskLevel: highestRisk,
    category: metadataJsonData?.category || (files.some((f) => f.type === "component") ? "Componente UI" : files.some((f) => f.type === "api") ? "API / Backend" : "Extensão do Sistema"),
    sourceType: "zip",
    originalFileName,
    fileCount: files.length,
    dependencies,
    envRequired: Array.from(envSet),
    apiEndpoints,
    conflicts,
    files,
    versions: [
      {
        version: packageJsonData?.version || metadataJsonData?.version || "1.0.0",
        date: new Date().toISOString(),
        notes: `Importação inicial do pacote ${originalFileName}`,
        status: "testing"
      }
    ],
    previewType: metadataJsonData?.previewType || detectPreviewType(files, name)
  };
}

function detectPreviewType(files, name) {
  const text = (name + " " + files.map((f) => f.path).join(" ")).toLowerCase();
  if (text.includes("financiamento") || text.includes("calculadora") || text.includes("parcela")) return "calculator";
  if (text.includes("agenda") || text.includes("visita") || text.includes("horario")) return "scheduler";
  if (text.includes("itbi") || text.includes("cartorio") || text.includes("escritura")) return "itbi_calculator";
  if (text.includes("comparador") || text.includes("comparar")) return "comparator";
  return "generic";
}
