"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { purposeLabels, typeLabels } from "../properties";
import { navigate, propertyArea, whatsappFor } from "../utils";
import { hasNumericPrice, isCatalogProperty, propertyBedroomTotal, propertyHasFeature, propertyStatus } from "../propertyStatus";
import { Icon } from "./Icons";
import PropertyCard from "./PropertyCard";

const emptyFilters = {
  purpose: "",
  type: "",
  neighborhood: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  suites: "",
  parking: "",
  piscina: false,
  gourmet: false,
  solar: false,
  twoFloors: false,
  gated: false,
  planned: false,
  furnished: false,
  financeable: false,
  favoritesOnly: false,
};

function initialFilters(query) {
  const params = new URLSearchParams(query || "");
  return {
    ...emptyFilters,
    purpose: params.get("purpose") || "",
    type: params.get("type") || "",
    maxPrice: params.get("price") || "",
    bedrooms: params.get("bedrooms") || "",
  };
}

function numberOrZero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function propertyRegion(property) {
  return property.neighborhood || property.publicLocation || "";
}

export default function Catalog({ properties, favorites, onFavorite, query }) {
  const [filters, setFilters] = useState(() => initialFilters(query));
  const [sort, setSort] = useState("recent");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const filtersPanelRef = useRef(null);
  const filtersButtonRef = useRef(null);

  useEffect(() => {
    setFilters(initialFilters(query));
  }, [query]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 860px)");
    const sync = () => setMobileFilters(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;
    filtersPanelRef.current?.querySelector("button, select, input")?.focus();
  }, [filtersOpen]);

  function closeFilters() {
    setFiltersOpen(false);
    if (mobileFilters) window.requestAnimationFrame(() => filtersButtonRef.current?.focus());
  }

  function update(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  const visibleProperties = properties.filter(isCatalogProperty);

  const neighborhoods = [...new Set(visibleProperties.map(propertyRegion).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "pt-BR")
  );

  const filtered = useMemo(() => {
    const result = visibleProperties.filter((property) => {
      if (filters.purpose && property.purpose !== filters.purpose) return false;
      if (filters.type && property.type !== filters.type) return false;
      if (filters.neighborhood && propertyRegion(property) !== filters.neighborhood) return false;
      if ((filters.minPrice || filters.maxPrice) && !hasNumericPrice(property)) return false;
      if (filters.minPrice && Number(property.price) < numberOrZero(filters.minPrice)) return false;
      if (filters.maxPrice && Number(property.price) > numberOrZero(filters.maxPrice)) return false;
      if (filters.bedrooms && propertyBedroomTotal(property) < numberOrZero(filters.bedrooms)) return false;
      if (filters.suites && property.suites < numberOrZero(filters.suites)) return false;
      if (filters.parking && property.parking < numberOrZero(filters.parking)) return false;
      if (filters.piscina && !propertyHasFeature(property, "piscina")) return false;
      if (filters.gourmet && !propertyHasFeature(property, ["área gourmet", "espaço gourmet", "gourmet" ])) return false;
      if (filters.solar && !propertyHasFeature(property, "energia solar")) return false;
      if (filters.twoFloors && !propertyHasFeature(property, ["dois pisos", "2 pisos", "sobrado", "duplex"])) return false;
      if (filters.gated && !propertyHasFeature(property, ["condomínio fechado", "condominio fechado"])) return false;
      if (filters.planned && !propertyHasFeature(property, ["planejad", "marcenaria planejada", "armários planejados"])) return false;
      if (filters.furnished && property.furnished !== true) return false;
      if (filters.financeable && !property.financeable) return false;
      if (filters.favoritesOnly && !favorites.includes(property.id)) return false;
      return true;
    });

    return result.sort((a, b) => {
      const availabilityRank = Number(!propertyStatus(a).commercial) - Number(!propertyStatus(b).commercial);
      if (availabilityRank !== 0) return availabilityRank;
      if (sort === "lowest") {
        if (!hasNumericPrice(a)) return 1;
        if (!hasNumericPrice(b)) return -1;
        return Number(a.price) - Number(b.price);
      }
      if (sort === "highest") {
        if (!hasNumericPrice(a)) return 1;
        if (!hasNumericPrice(b)) return -1;
        return Number(b.price) - Number(a.price);
      }
      if (sort === "area") return propertyArea(b) - propertyArea(a);
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
  }, [filters, favorites, sort, properties]);

  const activeCount = Object.entries(filters).filter(([, value]) => value !== "" && value !== false).length;

  return (
    <main className="catalog-page">
      <section className="page-banner">
        <div className="container">
          <p className="eyebrow">Catálogo imobiliário</p>
          <h1>Imóveis em Redenção</h1>
          <p>Explore as opções e ajuste os filtros de acordo com o que você procura.</p>
        </div>
      </section>

      <section className="section catalog-section">
        <div className="container catalog-layout">
          <aside
            ref={filtersPanelRef}
            id="catalog-filters"
            className={`filters-panel ${filtersOpen ? "is-open" : ""}`}
            aria-label="Filtros de imóveis"
            aria-hidden={mobileFilters && !filtersOpen ? true : undefined}
            inert={mobileFilters && !filtersOpen ? true : undefined}
          >
            <div className="filters-title">
              <div>
                <h2>Filtrar imóveis</h2>
                {activeCount > 0 && <span>{activeCount} filtro{activeCount > 1 ? "s" : ""} ativo{activeCount > 1 ? "s" : ""}</span>}
              </div>
              <button className="mobile-close" type="button" onClick={closeFilters} aria-label="Fechar filtros">
                <Icon name="close" size={22} />
              </button>
            </div>

            <fieldset>
              <legend>Finalidade</legend>
              <div className="segmented">
                <button type="button" aria-pressed={filters.purpose === ""} className={filters.purpose === "" ? "selected" : ""} onClick={() => update("purpose", "")}>Todos</button>
                {Object.entries(purposeLabels).map(([value, label]) => (
                  <button key={value} type="button" aria-pressed={filters.purpose === value} className={filters.purpose === value ? "selected" : ""} onClick={() => update("purpose", value)}>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="field">
              <label htmlFor="filter-type">Tipo do imóvel</label>
              <select id="filter-type" value={filters.type} onChange={(e) => update("type", e.target.value)}>
                <option value="">Todos os tipos</option>
                {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            <div className="field">
              <label htmlFor="filter-neighborhood">Bairro ou condomínio</label>
              <select id="filter-neighborhood" value={filters.neighborhood} onChange={(e) => update("neighborhood", e.target.value)}>
                <option value="">Todas as regiões</option>
                {neighborhoods.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <fieldset>
              <legend>Faixa de valor</legend>
              <div className="two-fields">
                <div>
                  <label htmlFor="min-price">Mínimo (R$)</label>
                  <input id="min-price" inputMode="numeric" type="number" min="0" placeholder="0" value={filters.minPrice} onChange={(e) => update("minPrice", e.target.value)} />
                </div>
                <div>
                  <label htmlFor="max-price">Máximo (R$)</label>
                  <input id="max-price" inputMode="numeric" type="number" min="0" placeholder="Sem limite" value={filters.maxPrice} onChange={(e) => update("maxPrice", e.target.value)} />
                </div>
              </div>
            </fieldset>

            <div className="three-fields">
              {[
                ["bedrooms", "Quartos"],
                ["suites", "Suítes"],
                ["parking", "Vagas"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label htmlFor={`filter-${field}`}>{label}</label>
                  <select id={`filter-${field}`} value={filters[field]} onChange={(e) => update(field, e.target.value)}>
                    <option value="">Todos</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              ))}
            </div>

            <fieldset className="checkbox-group">
              <legend>Características</legend>
              {[
                ["piscina", "Piscina"],
                ["gourmet", "Área gourmet"],
                ["solar", "Energia solar"],
                ["twoFloors", "Dois pisos"],
                ["gated", "Condomínio fechado"],
                ["planned", "Móveis planejados"],
                ["furnished", "Mobiliado"],
                ["financeable", "Financiável"],
              ].map(([field, label]) => (
                <label key={field}>
                  <input type="checkbox" checked={filters[field]} onChange={(e) => update(field, e.target.checked)} />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>

            <label className="favorites-filter">
              <input type="checkbox" checked={filters.favoritesOnly} onChange={(e) => update("favoritesOnly", e.target.checked)} />
              <Icon name="heart" size={18} />
              <span>Meus favoritos ({favorites.length})</span>
            </label>

            <button className="button button-ghost button-full" type="button" onClick={() => setFilters(emptyFilters)}>
              Limpar todos os filtros
            </button>
            <button className="button button-primary button-full apply-mobile" type="button" onClick={closeFilters}>
              Ver {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </button>
          </aside>

          <div className="catalog-results">
            <div className="results-toolbar">
              <div>
                <button ref={filtersButtonRef} className="button button-outline mobile-filter-button" type="button" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(true)}>
                  <Icon name="filter" size={18} /> Filtros
                  {activeCount > 0 && <span className="count-badge">{activeCount}</span>}
                </button>
                <p aria-live="polite">
                  <strong>{filtered.length}</strong> {filtered.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
                </p>
              </div>
              <div className="sort-field">
                <label htmlFor="sort">Ordenar por</label>
                <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="recent">Mais recentes</option>
                  <option value="lowest">Menor valor</option>
                  <option value="highest">Maior valor</option>
                  <option value="area">Maior área</option>
                </select>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="property-grid catalog-grid">
                {filtered.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    favorite={favorites.includes(property.id)}
                    onFavorite={onFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon"><Icon name="search" size={28} /></span>
                <h2>Nenhum imóvel encontrado</h2>
                <p>Tente remover alguns filtros ou conte o que você procura para nossa equipe.</p>
                <div>
                  <button className="button button-outline" type="button" onClick={() => setFilters(emptyFilters)}>
                    Limpar filtros
                  </button>
                  <a className="button button-primary" href={whatsappFor()} target="_blank" rel="noreferrer">
                    <Icon name="whatsapp" size={18} /> Falar no WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      {filtersOpen && <button className="filter-backdrop" type="button" aria-label="Fechar filtros" onClick={closeFilters} />}
    </main>
  );
}

