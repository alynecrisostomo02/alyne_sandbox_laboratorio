"use client";

import { useState, useMemo } from "react";
import { Icon } from "./Icons";
import {
  getCoordinatesForAddress,
  getNearbyPOIsForLocation,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
  getGoogleMapsUrl,
  determineZone,
} from "../utils/addressGeocoding";

export default function PropertyLocationMap({ property }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const neighborhood = property?.neighborhood || "";
  const address = property?.address || "";
  const publicLocation = property?.publicLocation || `${neighborhood ? `${neighborhood}, ` : ""}Redenção, PA`;

  // Coordenadas do imóvel (se já gravadas no imóvel ou inferidas pelo endereço/bairro)
  const coords = useMemo(() => {
    if (property?.latitude && property?.longitude) {
      return {
        lat: Number(property.latitude),
        lng: Number(property.longitude),
        zone: property.zone || determineZone(neighborhood),
      };
    }
    if (property?.coordinates?.lat && property?.coordinates?.lng) {
      return {
        lat: Number(property.coordinates.lat),
        lng: Number(property.coordinates.lng),
        zone: property.zone || determineZone(neighborhood),
      };
    }
    return getCoordinatesForAddress({
      address,
      neighborhood,
      cep: property?.cep,
      city: property?.city || "Redenção",
    });
  }, [property, neighborhood, address]);

  // Lista de POIs com distâncias calculadas a partir das coordenadas
  const allPOIs = useMemo(() => {
    return getNearbyPOIsForLocation({
      lat: coords.lat,
      lng: coords.lng,
      neighborhood,
    });
  }, [coords, neighborhood]);

  const filteredPOIs = useMemo(() => {
    if (activeCategory === "all") return allPOIs;
    return allPOIs.filter((poi) => poi.category === activeCategory);
  }, [allPOIs, activeCategory]);

  const categories = [
    { key: "all", label: "Todos", icon: "spark" },
    { key: "education", label: "Educação", icon: "school" },
    { key: "convenience", label: "Mercados", icon: "cart" },
    { key: "leisure", label: "Lazer & Parques", icon: "tree" },
    { key: "health", label: "Saúde", icon: "hospital" },
    { key: "dining", label: "Gastronomia", icon: "utensils" },
  ];

  const embedUrl = getGoogleMapsEmbedUrl({
    lat: coords.lat,
    lng: coords.lng,
    query: `${publicLocation}, Redenção, PA`,
  });

  const directionsUrl = getGoogleMapsDirectionsUrl({
    lat: coords.lat,
    lng: coords.lng,
    address: `${address ? `${address}, ` : ""}${publicLocation}`,
  });

  const fullMapUrl = getGoogleMapsUrl({
    lat: coords.lat,
    lng: coords.lng,
    query: `${publicLocation}, Redenção, PA`,
  });

  return (
    <section className="detail-section property-location-section" aria-labelledby="location-heading">
      <div className="location-section-header">
        <div>
          <span className="location-eyebrow">
            <Icon name="compass" size={15} /> {coords.zone || "Redenção - PA"}
          </span>
          <h2 id="location-heading">Localização & Proximidades</h2>
          <p className="location-address-text">
            <Icon name="pin" size={16} />
            <span>{publicLocation}</span>
          </p>
        </div>

        <div className="location-header-actions">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-primary location-route-btn"
            title="Calcular rota no Google Maps a partir da sua localização atual"
          >
            <Icon name="navigation" size={16} /> Traçar Rota no Google Maps
          </a>
        </div>
      </div>

      <div className="property-location-grid">
        {/* Mapa Interativo Google Maps */}
        <div className="property-map-card">
          <div className="property-map-container">
            <iframe
              title={`Mapa do imóvel em ${publicLocation}`}
              src={embedUrl}
              className="property-google-iframe"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="property-map-overlay-badge">
              <span className="map-badge-dot" />
              <span>{neighborhood || "Redenção, PA"}</span>
            </div>
          </div>

          <div className="property-map-footer">
            <div className="map-coords-info">
              <small>Coordenadas:</small>
              <code>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</code>
            </div>
            <a
              href={fullMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="map-view-fullscreen-link"
            >
              <span>Ver mapa ampliado</span>
              <Icon name="arrow" size={14} />
            </a>
          </div>
        </div>

        {/* Painel de Pontos de Interesse (POIs) */}
        <div className="property-pois-card">
          <div className="pois-header">
            <h3>
              <Icon name="pin" size={18} /> Pontos de Interesse & Conveniências
            </h3>
            <p>Distâncias estimadas a partir da localização do imóvel em Redenção:</p>
          </div>

          {/* Filtros de Categoria */}
          <div className="poi-categories-bar" role="tablist" aria-label="Categorias de proximidades">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.key}
                className={`poi-category-btn ${activeCategory === cat.key ? "is-active" : ""}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                <Icon name={cat.icon} size={13} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Lista de POIs */}
          <div className="poi-items-list" role="tabpanel">
            {filteredPOIs.map((poi) => (
              <article key={poi.id} className="poi-item-card">
                <div className={`poi-icon-box poi-category-${poi.category}`}>
                  <Icon name={poi.icon} size={18} />
                </div>
                <div className="poi-info">
                  <h4>{poi.name}</h4>
                  <p>{poi.description}</p>
                </div>
                <div className="poi-distances">
                  <span className="poi-distance-badge" title="Distância em linha reta">
                    {poi.distanceFormatted}
                  </span>
                  <div className="poi-times">
                    <span title="Tempo estimado de carro">🚗 {poi.driveMinutes} min</span>
                    {poi.walkMinutes <= 20 && (
                      <span title="Tempo estimado de caminhada">🚶 {poi.walkMinutes} min</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
