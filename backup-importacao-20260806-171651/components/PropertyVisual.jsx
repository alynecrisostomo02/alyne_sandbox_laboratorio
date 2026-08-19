export default function PropertyVisual({
  image,
  title,
  className = "",
  priorityLabel = true,
}) {
  if (image.src) {
    return (
      <div className={`property-visual has-photo tone-${image.tone} ${className}`}>
        <img src={image.src} alt={`${image.label} — ${title}`} loading="lazy" />
      </div>
    );
  }

  return (
    <div
      className={`property-visual tone-${image.tone} ${className}`}
      role="img"
      aria-label={`Espaço reservado para foto: ${image.label} — ${title}`}
    >
      <div className="visual-grid" aria-hidden="true" />
      <span className="photo-label">
        <span>Foto do imóvel</span>
        {priorityLabel && <small>{image.label}</small>}
      </span>
    </div>
  );
}
