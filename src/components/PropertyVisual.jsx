import { normalizePropertyImage } from "../propertyStatus";

export default function PropertyVisual({
  image,
  title,
  className = "",
  loading = "lazy",
}) {
  const normalized = normalizePropertyImage(image, title || "Foto do imóvel");
  if (!normalized) return null;

  return (
    <div className={`property-visual has-photo fit-${normalized.fit} ${normalized.tone ? `tone-${normalized.tone}` : ""} ${className}`}>
      <img
        src={normalized.src}
        alt={normalized.alt}
        loading={loading}
        style={{ objectFit: normalized.fit, objectPosition: normalized.position }}
      />
    </div>
  );
}
