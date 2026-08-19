const FALLBACK_STATUS = {
  key: "unknown",
  label: "Status não informado",
  catalog: false,
  home: false,
  recommender: false,
  detail: false,
  favorite: false,
  commercial: false,
  cta: "none",
  cardAction: "Ver detalhes",
};

export const PROPERTY_STATUS = Object.freeze({
  "Disponível": {
    key: "available",
    label: "Disponível",
    catalog: true,
    home: true,
    recommender: true,
    detail: true,
    favorite: true,
    commercial: true,
    cta: "visit",
    cardAction: "Ver detalhes",
  },
  "Disponibilidade sob consulta": {
    key: "consultation",
    label: "Disponibilidade sob consulta",
    catalog: true,
    home: true,
    recommender: true,
    detail: true,
    favorite: true,
    commercial: true,
    cta: "availability",
    cardAction: "Consultar detalhes",
  },
  "Em preparação": {
    key: "preparation",
    label: "Em preparação",
    catalog: false,
    home: false,
    recommender: false,
    detail: true,
    favorite: false,
    commercial: false,
    cta: "none",
    cardAction: "Ver informações",
  },
  "Indisponível": {
    key: "unavailable",
    label: "Indisponível",
    catalog: true,
    home: false,
    recommender: false,
    detail: true,
    favorite: false,
    commercial: false,
    cta: "alternatives",
    cardAction: "Ver histórico",
  },
  Arquivado: {
    key: "archived",
    label: "Arquivado",
    catalog: false,
    home: false,
    recommender: false,
    detail: false,
    favorite: false,
    commercial: false,
    cta: "none",
    cardAction: "Ver histórico",
  },
});

export function propertyStatus(propertyOrStatus) {
  const status = typeof propertyOrStatus === "string"
    ? propertyOrStatus
    : propertyOrStatus?.status;
  const definition = PROPERTY_STATUS[status];
  if (definition && typeof propertyOrStatus === "object" && definition.key === "unavailable") {
    return {
      ...definition,
      label: propertyOrStatus?.purpose === "locacao" ? "Alugado" : "Vendido",
      cardAction: "Ver detalhes",
    };
  }
  return definition || {
    ...FALLBACK_STATUS,
    label: status || FALLBACK_STATUS.label,
  };
}

export function normalizePropertyImage(image, fallbackAlt = "Foto do imóvel") {
  if (typeof image === "string") {
    return image ? { src: image, alt: fallbackAlt, position: "center", fit: "cover" } : null;
  }
  if (!image?.src) return null;
  return {
    ...image,
    alt: image.alt || image.label || fallbackAlt,
    position: image.position || image.objectPosition || "center",
    fit: image.fit === "contain" ? "contain" : "cover",
  };
}

export function propertyGallery(property) {
  const gallery = Array.isArray(property?.gallery)
    ? property.gallery
    : property?.gallery
      ? [property.gallery]
      : [];
  const candidates = [property?.mainImage, ...gallery];
  const seen = new Set();
  return candidates.reduce((images, candidate) => {
    const image = normalizePropertyImage(candidate, property?.title || "Foto do imóvel");
    if (!image || seen.has(image.src)) return images;
    seen.add(image.src);
    images.push(image);
    return images;
  }, []);
}

export function hasPublicPhoto(property) {
  return propertyGallery(property).length > 0;
}

export function isCatalogProperty(property) {
  return propertyStatus(property).catalog && hasPublicPhoto(property);
}

export function isHomeProperty(property) {
  return propertyStatus(property).home && hasPublicPhoto(property);
}

export function isRecommendableProperty(property) {
  return propertyStatus(property).recommender && hasPublicPhoto(property);
}

export function isDetailProperty(property) {
  return Boolean(property && propertyStatus(property).detail);
}

export function isFavoriteProperty(property) {
  return propertyStatus(property).favorite && hasPublicPhoto(property);
}

const publicCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function hasNumericPrice(property) {
  return Number.isFinite(Number(property?.price)) && Number(property.price) > 0;
}

export function propertyBedroomTotal(property) {
  const bedrooms = Number(property?.bedrooms) || 0;
  const suites = Number(property?.suites) || 0;
  return bedrooms + suites;
}

export function propertyPriceLabel(property) {
  const status = propertyStatus(property);
  if (!hasNumericPrice(property)) {
    if (status.key === "unavailable" || status.key === "archived") return "Sem oferta ativa";
    return "Valor sob consulta";
  }
  const prefix = property.priceNote === "a partir de" ? "A partir de " : "";
  const suffix = property.purpose === "locacao" ? "/mês" : "";
  return `${prefix}${publicCurrency.format(Number(property.price))}${suffix}`;
}

export function propertyPriceNoteLabel(property) {
  const note = String(property?.priceNote || "").trim();
  if (!note || note === "a partir de" || /^valor sob consulta$/i.test(note)) return "";
  if (propertyStatus(property).key === "unavailable" && /^imóvel já alugado$/i.test(note)) return "";
  return note;
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export function propertySearchText(property) {
  return normalizeSearchText([
    ...(property?.features || []),
    ...(property?.amenities || []),
    property?.furnished ? "mobiliado" : "",
  ].join(" "));
}

export function propertyHasFeature(property, terms) {
  const haystack = propertySearchText(property);
  const candidates = Array.isArray(terms) ? terms : [terms];
  return candidates.some((term) => haystack.includes(normalizeSearchText(term)));
}

export function propertyPublicLocation(property) {
  if (property?.publicLocation) return property.publicLocation;
  return [property?.neighborhood, property?.city].filter(Boolean).join(", ");
}

export function propertyReference(property) {
  if (!property) return "";
  if (!property.idRef) return String(property.id || "").trim();
  const reference = String(property.idRef).replace(/^REF[-\s]*/i, "").trim();
  return reference ? `REF ${reference}` : String(property.id || "").trim();
}
