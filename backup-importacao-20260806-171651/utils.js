import { whatsappUrl } from "./config";

export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function formatPrice(property) {
  const prefix = property.priceNote === "a partir de" ? "A partir de " : "";
  const suffix = property.purpose === "locacao" ? "/mês" : "";
  const extra = property.priceNote && property.priceNote !== "a partir de"
    ? ` ${property.priceNote}`
    : "";
  return `${prefix}${currency.format(property.price)}${suffix}${extra}`;
}

export function whatsappFor(property, intent = "info") {
  if (!property) {
    return whatsappUrl(
      "Olá! Visitei o site e gostaria de ajuda para encontrar um imóvel em Redenção."
    );
  }
  const action =
    intent === "visit"
      ? "gostaria de agendar uma visita"
      : intent === "availability"
        ? "gostaria de confirmar a disponibilidade e os dados atuais"
      : "gostaria de receber mais informações";
  return whatsappUrl(
    `Olá! Vi no site o imóvel ${property.title}, código ${property.id}, e ${action}.`
  );
}

export function isNew(publishedAt) {
  const published = new Date(`${publishedAt}T12:00:00`);
  if (Number.isNaN(published.getTime())) return false;
  const elapsed = Date.now() - published.getTime();
  return elapsed >= 0 && elapsed <= 14 * 86400000;
}

export function propertyArea(property) {
  return property.builtArea || property.landArea || 0;
}

export function navigate(hash) {
  if (typeof window === "undefined") return;
  if (window.location.hash === hash) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.location.hash = hash;
  }
}
