import { existsSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { properties } from "../src/properties.js";

const errors = [];
const ids = new Set();
const refs = new Set();
const slugs = new Set();
const mediaOwners = new Map();

const allowedStatuses = new Set([
  "Disponível",
  "Disponibilidade sob consulta",
  "Em preparação",
  "Indisponível",
  "Arquivado",
]);
const allowedPurposes = new Set(["venda", "locacao"]);
const forbiddenPublicKeys = [
  "adminStatus",
  "auditStatus",
  "mediaUrls",
  "sourceFolderUrl",
  "sourceReference",
  "videoUrl",
];
const forbiddenText = [
  /drive\.google\.com/i,
  /docs\.google\.com/i,
  /[A-Z]:\\Users\\/i,
  /sourceFolderUrl/i,
  /mediaUrls/i,
  /adminStatus/i,
];
const blockedStandaloneRefs = new Set([
  "012",
  "014",
  "016",
  "018",
  "019",
  "020",
  "027",
  "045",
]);
const mediaExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolute) : [absolute];
  });
}

function normalizeImage(image) {
  return typeof image === "string" ? { src: image } : image || {};
}

function addUnique(set, value, label) {
  const normalized = String(value || "").toLocaleLowerCase("pt-BR");
  if (!normalized || set.has(normalized)) {
    errors.push(`${label} ausente ou duplicado: ${value || "(vazio)"}`);
    return;
  }
  set.add(normalized);
}

for (const property of properties) {
  addUnique(ids, property.id, "Código");
  addUnique(refs, property.idRef, "Referência");
  addUnique(slugs, property.slug, "Slug");

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(property.slug || "")) {
    errors.push(`Slug inválido em ${property.id}: ${property.slug || "(vazio)"}`);
  }
  if (!property.title || !property.city || !property.type || !property.fullDescription) {
    errors.push(`Campos públicos obrigatórios ausentes em ${property.id}`);
  }
  if (!allowedPurposes.has(property.purpose)) {
    errors.push(`Finalidade inválida em ${property.id}: ${property.purpose}`);
  }
  if (!allowedStatuses.has(property.status)) {
    errors.push(`Status inválido em ${property.id}: ${property.status}`);
  }
  if (blockedStandaloneRefs.has(property.idRef)) {
    errors.push(`Referência histórica publicada separadamente em ${property.id}: ${property.idRef}`);
  }
  if (
    property.price == null
    && property.priceOnRequest !== true
    && !["Indisponível", "Arquivado"].includes(property.status)
  ) {
    errors.push(`Preço ausente sem indicação pública de consulta em ${property.id}`);
  }
  if (property.price != null && (!Number.isFinite(property.price) || property.price < 0)) {
    errors.push(`Preço inválido em ${property.id}`);
  }
  if (property.featured && !["Disponível", "Disponibilidade sob consulta"].includes(property.status)) {
    errors.push(`Imóvel inelegível marcado como destaque: ${property.id}`);
  }

  for (const key of forbiddenPublicKeys) {
    if (Object.hasOwn(property, key)) {
      errors.push(`Campo interno exposto no catálogo público em ${property.id}: ${key}`);
    }
  }
  const serialized = JSON.stringify(property);
  for (const pattern of forbiddenText) {
    if (pattern.test(serialized)) {
      errors.push(`Conteúdo interno/privado exposto em ${property.id}: ${pattern}`);
    }
  }

  const mainImage = normalizeImage(property.mainImage);
  const gallery = (property.gallery || []).map(normalizeImage);
  if (!mainImage.src || gallery.length === 0) {
    errors.push(`Capa ou galeria ausente em ${property.id}`);
    continue;
  }
  if (mainImage.src !== gallery[0]?.src) {
    errors.push(`A capa não é a primeira imagem da galeria em ${property.id}`);
  }

  const propertyMedia = new Set();
  for (const image of gallery) {
    if (!image.src) {
      errors.push(`Imagem sem caminho em ${property.id}`);
      continue;
    }
    if (!image.src.startsWith("/imoveis/") || /placeholder|pendente|interna/i.test(image.src)) {
      errors.push(`Mídia pública inválida em ${property.id}: ${image.src}`);
    }
    if (image.logoVerified !== true || !/-logo(?:[-_.]|$)/i.test(image.src)) {
      errors.push(`Imagem sem confirmação explícita da logo Alyne em ${property.id}: ${image.src}`);
    }
    if (!image.alt || image.alt.trim().length < 8) {
      errors.push(`Texto alternativo ausente ou insuficiente em ${property.id}: ${image.src}`);
    }

    const relativePath = image.src.replace(/^\/+/, "");
    if (!existsSync(join("public", relativePath))) {
      errors.push(`Imagem inexistente em ${property.id}: ${image.src}`);
    }
    if (propertyMedia.has(image.src)) {
      errors.push(`Imagem repetida na galeria de ${property.id}: ${image.src}`);
    }
    propertyMedia.add(image.src);

    const owner = mediaOwners.get(image.src);
    if (owner && owner !== property.id) {
      errors.push(`Imagem compartilhada entre imóveis ${owner} e ${property.id}: ${image.src}`);
    }
    mediaOwners.set(image.src, property.id);
  }
}

const publicMediaRoot = join("public", "imoveis");
for (const file of listFiles(publicMediaRoot)) {
  if (!mediaExtensions.has(extname(file).toLocaleLowerCase("pt-BR"))) continue;
  const publicPath = `/${relative("public", file).replaceAll("\\", "/")}`;
  if (!mediaOwners.has(publicPath)) {
    errors.push(`Imagem de imóvel órfã ou não auditada no bundle público: ${publicPath}`);
  }
  if (!/-logo(?:[-_.]|$)/i.test(publicPath)) {
    errors.push(`Imagem pública sem convenção de logo verificada: ${publicPath}`);
  }
}

if (errors.length > 0) {
  throw new Error("Verificação do catálogo falhou:\n- " + [...new Set(errors)].join("\n- "));
}

console.log(
  `Catálogo verificado: ${properties.length} imóveis, ${mediaOwners.size} imagens com logo, ` +
    "IDs, REFs, slugs, privacidade, status e consolidações consistentes."
);
