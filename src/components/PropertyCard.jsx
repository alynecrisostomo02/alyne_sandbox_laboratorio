"use client";

import { Icon } from "./Icons";
import PropertyVisual from "./PropertyVisual";
import { navigate, propertyArea } from "../utils";
import {
  propertyPriceLabel,
  propertyPriceNoteLabel,
  propertyPublicLocation,
  propertyGallery,
  propertyStatus,
} from "../propertyStatus";

export default function PropertyCard({ property, favorite, onFavorite }) {
  const status = propertyStatus(property);
  const area = propertyArea(property);
  const location = propertyPublicLocation(property);
  const cover = propertyGallery(property)[0];
  const priceNote = propertyPriceNoteLabel(property);

  return (
    <article className={`property-card property-card-${status.key}`}>
      <div className="card-media">
        <PropertyVisual image={cover} title={property.title} />
        <span className="purpose-chip">
          {property.purpose === "venda" ? "Venda" : "Locação"}
        </span>
        <span className={`status-chip status-${status.key}`}>{status.label}</span>
        {status.favorite && (
          <button
            className={`favorite-button ${favorite ? "is-favorite" : ""}`}
            type="button"
            aria-label={`${favorite ? "Remover" : "Adicionar"} ${property.title} dos favoritos`}
            aria-pressed={favorite}
            onClick={() => onFavorite(property.id)}
          >
            <Icon name="heart" size={19} />
          </button>
        )}
      </div>
      <div className="card-body">
        {location && (
          <p className="card-location">
            <Icon name="pin" size={15} />
            {location}
          </p>
        )}
        <h3>{property.title}</h3>
        <p className="card-price">{propertyPriceLabel(property)}</p>
        {priceNote && <p className="card-price-note">{priceNote}</p>}
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
          {status.cardAction} <Icon name="arrow" size={17} />
        </button>
      </div>
    </article>
  );
}
