"use client";

import { motion } from "motion/react";
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

export default function PropertyCard({ property, favorite, onFavorite, index = 0 }) {
  const status = propertyStatus(property);
  const area = propertyArea(property);
  const location = propertyPublicLocation(property);
  const cover = propertyGallery(property)[0];
  const priceNote = propertyPriceNoteLabel(property);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{
        duration: 0.32,
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(index * 0.04, 0.2),
      }}
      whileHover={{ y: -4, transition: { duration: 0.22, ease: "easeOut" } }}
      className={`property-card property-card-${status.key}`}
    >
      <div className="card-media">
        <PropertyVisual image={cover} title={property.title} />
        {/* Folha / Broto botânico de luxo que desabrocha no hover */}
        <div className="card-leaf-corner" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="leaf-sprout-svg">
            <path
              className="leaf-stem"
              d="M6 26C8.5 20 13 15.5 19 12.5C22.5 11 25.5 8.5 26 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              className="leaf-blade leaf-blade-main"
              d="M19 12.5C22 7.5 25.5 5.5 26 5C26.5 9 24 13.5 19.5 16C17.8 17 16.5 16.8 16.5 16.8C16.5 16.8 17 14.5 19 12.5Z"
              fill="currentColor"
              fillOpacity="0.18"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="leaf-blade leaf-blade-sub"
              d="M12.5 18C10 15.5 8 12.5 9 9.5C11.5 9.5 14.5 12 15.5 15"
              fill="currentColor"
              fillOpacity="0.14"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
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
    </motion.article>
  );
}
