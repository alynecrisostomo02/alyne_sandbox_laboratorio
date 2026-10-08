import { normalizePropertyImage } from "../propertyStatus";
import { useState } from "react";

export default function PropertyVisual({
  image,
  title,
  className = "",
  loading = "lazy",
}) {
  const [hasError, setHasError] = useState(false);
  const normalized = normalizePropertyImage(image, title || "Foto do imóvel");
  if (!normalized) return null;

  return (
    <div className={`property-visual has-photo fit-${normalized.fit} ${normalized.tone ? `tone-${normalized.tone}` : ""} ${className}`}>
      <img
        src={normalized.src}
        alt={normalized.alt}
        loading={loading}
        style={{ objectFit: normalized.fit, objectPosition: normalized.position, display: hasError ? 'none' : 'block' }}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
