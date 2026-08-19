"use client";

import { useEffect, useState } from "react";
import { currency, navigate, whatsappFor } from "../utils";
import {
  propertyGallery,
  propertyPriceLabel,
  propertyPriceNoteLabel,
  propertyPublicLocation,
  propertyReference,
  propertyStatus,
} from "../propertyStatus";
import { Icon } from "./Icons";
import PropertyVisual from "./PropertyVisual";

const typeNames = {
  casa: "Casa",
  apartamento: "Apartamento",
  lote: "Lote",
  sala: "Sala comercial",
  "ponto-comercial": "Ponto comercial",
  condominio: "Imóvel em condomínio",
};

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function publicItems(value) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  const labels = values.flatMap((item) => {
    if (typeof item === "string" || typeof item === "number") return String(item).trim();
    if (!item || typeof item !== "object") return [];
    const label = item.label || item.name || item.title;
    const detail = item.value ?? item.amount ?? item.description;
    if (label && detail !== undefined && detail !== null && detail !== "") {
      return `${label}: ${feeLabel(detail)}`;
    }
    return label ? String(label).trim() : [];
  });
  return [...new Set(labels.filter(Boolean))];
}

function feeLabel(value) {
  if (typeof value === "number" && Number.isFinite(value)) return currency.format(value);
  return String(value || "").trim();
}

function dimensionLabel(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.filter(Boolean).join(" × ");
  return value.label || value.display || [value.width, value.depth].filter(Boolean).join(" × ");
}

export default function PropertyDetail({ property, favorite, onFavorite, onToast }) {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [property?.id]);

  if (!property) {
    return (
      <main className="not-found">
        <div className="container empty-state">
          <h1>Imóvel não encontrado</h1>
          <p>Este link pode estar incorreto ou o imóvel pode ter sido removido do catálogo.</p>
          <button className="button button-primary" type="button" onClick={() => navigate("#/imoveis")}>
            Voltar aos imóveis
          </button>
        </div>
      </main>
    );
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: property.title, text: `Veja este imóvel: ${property.title}`, url });
        return;
      }
      await copyText(url);
      onToast("Link copiado para a área de transferência.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        try {
          await copyText(url);
          onToast("Link copiado para a área de transferência.");
        } catch {
          onToast("Não foi possível compartilhar. Copie o endereço do navegador.");
        }
      }
    }
  }

  const status = propertyStatus(property);
  const gallery = propertyGallery(property);
  const currentImage = gallery[Math.min(imageIndex, Math.max(gallery.length - 1, 0))];
  const location = propertyPublicLocation(property);
  const reference = propertyReference(property);
  const priceNote = propertyPriceNoteLabel(property);
  const description = property.description || property.fullDescription || property.shortDescription;
  const propertyType = property.typeLabel || typeNames[property.type] || property.type;
  const landDimensions = dimensionLabel(property.landDimensions);
  const facts = [
    property.bedrooms > 0 && ["bed", property.bedrooms, "Quartos"],
    property.suites > 0 && ["bath", property.suites, "Suítes"],
    property.bathrooms > 0 && ["bath", property.bathrooms, "Banheiros"],
    property.lavabos > 0 && ["bath", property.lavabos, "Lavabos"],
    property.parking > 0 && ["car", property.parking, "Vagas"],
    property.builtArea > 0 && ["area", `${property.builtArea} m²`, "Área construída"],
    property.landArea > 0 && ["area", `${property.landArea} m²`, "Área do terreno"],
    landDimensions && ["area", landDimensions, "Dimensões do terreno"],
  ].filter(Boolean);
  const groups = [
    ["Características", publicItems(property.features)],
    ["Comodidades", publicItems(property.amenities)],
    ["Documentação", publicItems(property.documents)],
    ["Condições", publicItems(property.conditions)],
  ].filter(([, items]) => items.length > 0);
  const fees = [
    property.condominiumFee !== undefined && property.condominiumFee !== null && property.condominiumFee !== ""
      ? `Condomínio: ${feeLabel(property.condominiumFee)}`
      : null,
    ...publicItems(property.fees),
  ].filter(Boolean);

  const ctaContent = {
    visit: {
      title: "Gostou deste imóvel?",
      text: "Fale com a equipe para confirmar os detalhes e combinar uma visita.",
    },
    availability: {
      title: "Quer confirmar este imóvel?",
      text: "A disponibilidade precisa ser confirmada antes de qualquer visita ou decisão.",
    },
    alternatives: {
      title: "Este imóvel está indisponível",
      text: "Consulte outras opções ativas no catálogo.",
    },
    none: {
      title: status.key === "archived" ? "Anúncio arquivado" : "Anúncio em preparação",
      text: status.key === "archived"
        ? "Este registro foi preservado como histórico e não está em oferta."
        : "Este imóvel ainda não está pronto para atendimento comercial.",
    },
  }[status.cta];

  return (
    <main className={`detail-page detail-status-${status.key}`}>
      <div className="container detail-breadcrumb">
        <button type="button" onClick={() => navigate("#/imoveis")}>Imóveis</button>
        <Icon name="arrow" size={14} />
        <span>{property.title}</span>
      </div>

      {gallery.length > 0 && (
        <section className={`container detail-gallery ${gallery.length === 1 ? "single-image" : ""}`} aria-label="Galeria do imóvel">
          <div className="gallery-main">
            <PropertyVisual
              image={{ ...currentImage, fit: currentImage.fit || "contain" }}
              title={property.title}
              className="detail-visual"
              loading="eager"
            />
            <span className="gallery-count">{Math.min(imageIndex + 1, gallery.length)} / {gallery.length}</span>
          </div>
          {gallery.length > 1 && (
            <div className="gallery-thumbs">
              {gallery.map((image, index) => (
                <button
                  type="button"
                  key={`${image.src}-${index}`}
                  className={imageIndex === index ? "active" : ""}
                  aria-label={`Ver foto ${index + 1}: ${image.alt}`}
                  aria-pressed={imageIndex === index}
                  onClick={() => setImageIndex(index)}
                >
                  <PropertyVisual image={{ ...image, fit: "contain" }} title={property.title} />
                  <span>{image.label || image.alt}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="container detail-layout">
        <div className="detail-content">
          <div className="detail-title-row">
            <div>
              <div className="detail-labels">
                <span className="purpose-chip static">{property.purpose === "venda" ? "Venda" : "Locação"}</span>
                {propertyType && <span className="type-chip">{propertyType}</span>}
                <span className={`demo-pill status-${status.key}`}>{status.label}</span>
              </div>
              <h1>{property.title}</h1>
              {location && (
                <p className="detail-location">
                  <Icon name="pin" size={18} />
                  {location}
                </p>
              )}
            </div>
            <div className="detail-mobile-actions">
              {status.favorite && (
                <button className={`icon-action ${favorite ? "is-favorite" : ""}`} type="button" onClick={() => onFavorite(property.id)} aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={favorite}>
                  <Icon name="heart" />
                </button>
              )}
              <button className="icon-action" type="button" onClick={share} aria-label="Compartilhar imóvel">
                <Icon name="share" />
              </button>
            </div>
          </div>

          <p className="detail-price">{propertyPriceLabel(property)}</p>
          {priceNote && <p className="detail-price-note">{priceNote}</p>}

          {facts.length > 0 && (
            <div className="detail-facts">
              {facts.map(([icon, value, label]) => (
                <div key={label}>
                  <Icon name={icon} size={22} />
                  <span><strong>{value}</strong><small>{label}</small></span>
                </div>
              ))}
            </div>
          )}

          {description && (
            <div className="detail-section">
              <h2>Sobre este imóvel</h2>
              <p>{description}</p>
            </div>
          )}

          {groups.map(([title, items]) => (
            <div className="detail-section" key={title}>
              <h2>{title}</h2>
              <ul className="feature-list">
                {items.map((item) => (
                  <li key={item}><span><Icon name="check" size={15} /></span>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {fees.length > 0 && (
            <div className="detail-section detail-fees">
              <h2>Taxas e observações de preço</h2>
              <ul>
                {fees.map((fee) => <li key={fee}>{fee}</li>)}
              </ul>
            </div>
          )}

          {typeof property.financeable === "boolean" && (
            <div className="detail-section finance-box">
              <span><Icon name="check" size={20} /></span>
              <div>
                <h2>{property.financeable ? "Financiamento possível" : "Financiamento não disponível"}</h2>
                <p>
                  {property.financeable
                    ? "A contratação depende da documentação do imóvel, análise e aprovação da instituição financeira."
                    : "Esta condição foi informada para este anúncio."}
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className={`interest-card interest-${status.key}`}>
          <p className="eyebrow dark">Status do imóvel</p>
          <h2>{ctaContent.title}</h2>
          <p>{ctaContent.text}</p>
          {reference && (
            <div className="interest-code">
              <span>Referência do imóvel</span>
              <strong>{reference}</strong>
            </div>
          )}

          {status.cta === "visit" && (
            <>
              <a className="button button-primary button-full" href={whatsappFor(property)} target="_blank" rel="noreferrer">
                <Icon name="whatsapp" size={19} /> Consultar informações
              </a>
              <a className="button button-outline button-full" href={whatsappFor(property, "visit")} target="_blank" rel="noreferrer">
                Agendar visita
              </a>
            </>
          )}

          {status.cta === "availability" && (
            <a className="button button-primary button-full" href={whatsappFor(property, "availability")} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" size={19} /> Confirmar disponibilidade
            </a>
          )}

          {status.cta === "alternatives" && (
            <button className="button button-primary button-full" type="button" onClick={() => navigate("#/imoveis")}>
              Ver alternativas
            </button>
          )}

          {status.cta === "none" && (
            <button className="button button-outline button-full" type="button" onClick={() => navigate("#/imoveis")}>
              Voltar ao catálogo
            </button>
          )}

          <div className="interest-secondary">
            {status.favorite && (
              <button type="button" onClick={() => onFavorite(property.id)} aria-pressed={favorite}>
                <Icon name="heart" size={17} /> {favorite ? "Salvo nos favoritos" : "Salvar favorito"}
              </button>
            )}
            <button type="button" onClick={share}>
              <Icon name="share" size={17} /> Compartilhar link
            </button>
          </div>
          {status.commercial && <small>Ao continuar, você será direcionado para atendimento pelo WhatsApp.</small>}
        </aside>
      </section>
    </main>
  );
}
