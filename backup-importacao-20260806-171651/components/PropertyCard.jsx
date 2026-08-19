"use client";

import { Icon } from "./Icons";
import PropertyVisual from "./PropertyVisual";
import { formatPrice, isNew, navigate, propertyArea } from "../utils";

export default function PropertyCard({ property, favorite, onFavorite }) {
  const badge = property.status === "Exclusivo"
    ? "Exclusivo"
    : property.featured
      ? "Destaque"
      : isNew(property.publishedAt)
        ? "Novo"
        : null;
  const area = propertyArea(property);

  return (
    <article className="property-card">
      <div className="card-media">
        <PropertyVisual image={property.mainImage} title={property.title} />
        <span className="purpose-chip">
          {property.purpose === "venda" ? "Venda" : "Locação"}
        </span>
        {badge && <span className="status-chip">{badge}</span>}
        <button
          className={`favorite-button ${favorite ? "is-favorite" : ""}`}
          type="button"
          aria-label={`${favorite ? "Remover" : "Adicionar"} ${property.title} dos favoritos`}
          aria-pressed={favorite}
          onClick={() => onFavorite(property.id)}
        >
          <Icon name="heart" size={19} />
        </button>
      </div>
      <div className="card-body">
        <p className="card-verification">Demonstração · {property.status}</p>
        <p className="card-location">
          <Icon name="pin" size={15} />
          {property.neighborhood}, {property.city}
        </p>
        <h3>{property.title}</h3>
        <p className="card-price">{formatPrice(property)}</p>
        <div className="card-facts" aria-label="Características principais">
          {property.bedrooms > 0 && (
            <span title="Quartos"><Icon name="bed" size={17} />{property.bedrooms}</span>
          )}
          {property.suites > 0 && <span>{property.suites} suíte{property.suites > 1 ? "s" : ""}</span>}
          {property.parking > 0 && (
            <span title="Vagas"><Icon name="car" size={17} />{property.parking}</span>
          )}
          {area > 0 && (
            <span title="Área">
              <Icon name="area" size={17} />{area} m²
            </span>
          )}
        </div>
        <button
          className="button button-outline button-full"
          type="button"
          onClick={() => navigate(`#/imovel/${property.slug}`)}
        >
          Ver detalhes <Icon name="arrow" size={17} />
        </button>
      </div>
    </article>
  );
}
