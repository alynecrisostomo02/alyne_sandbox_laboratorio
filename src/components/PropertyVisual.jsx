import { useState } from "react";
import { normalizePropertyImage } from "../propertyStatus";

export default function PropertyVisual({
  image,
  title,
  className = "",
  loading = "lazy",
}) {
  const normalized = normalizePropertyImage(image, title || "Foto do imóvel");
  const [hasError, setHasError] = useState(false);

  if (!normalized) return null;

  return (
    <div className={`property-visual ${!hasError ? 'has-photo' : ''} fit-${normalized.fit} ${normalized.tone ? `tone-${normalized.tone}` : ""} ${className}`}>
      {!hasError && (
        <img
          src={normalized.src}
          alt={normalized.alt}
          loading={loading}
          style={{ objectFit: normalized.fit, objectPosition: normalized.position }}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
