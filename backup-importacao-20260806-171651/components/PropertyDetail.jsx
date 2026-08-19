"use client";

import { useEffect, useState } from "react";
import { formatPrice, navigate, propertyArea, whatsappFor } from "../utils";
import { Icon } from "./Icons";
import PropertyVisual from "./PropertyVisual";

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

  const facts = [
    property.bedrooms > 0 && ["bed", property.bedrooms, "Quartos"],
    property.suites > 0 && ["bath", property.suites, "Suítes"],
    property.bathrooms > 0 && ["bath", property.bathrooms, "Banheiros"],
    property.parking > 0 && ["car", property.parking, "Vagas"],
    propertyArea(property) > 0 && [
      "area",
      `${propertyArea(property)} m²`,
      property.builtArea ? "Área construída" : "Área do terreno",
    ],
  ].filter(Boolean);
  const isUnconfirmed = property.status === "A confirmar";

  return (
    <main className="detail-page">
      <div className="container detail-breadcrumb">
        <button type="button" onClick={() => navigate("#/imoveis")}>Imóveis</button>
        <Icon name="arrow" size={14} />
        <span>{property.title}</span>
      </div>

      <section className="container detail-gallery" aria-label="Galeria do imóvel">
        <div className="gallery-main">
          <PropertyVisual image={property.gallery[imageIndex]} title={property.title} className="detail-visual" />
          <span className="gallery-count">{imageIndex + 1} / {property.gallery.length}</span>
          <span className="demo-gallery-label">
            {property.gallery[imageIndex].src ? "Imagem fornecida" : "Foto pendente"}
          </span>
        </div>
        <div className="gallery-thumbs">
          {property.gallery.map((image, index) => (
            <button
              type="button"
              key={`${image.label}-${index}`}
              className={imageIndex === index ? "active" : ""}
              aria-label={`Ver ${image.label}`}
              aria-pressed={imageIndex === index}
              onClick={() => setImageIndex(index)}
            >
              <PropertyVisual image={image} title={property.title} priorityLabel={false} />
              <span>{image.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="container detail-layout">
        <div className="detail-content">
          <div className="detail-title-row">
            <div>
              <div className="detail-labels">
                <span className="purpose-chip static">{property.purpose === "venda" ? "Venda" : "Locação"}</span>
                <span className="demo-pill">Demonstração · {property.status}</span>
              </div>
              <h1>{property.title}</h1>
              <p className="detail-location">
                <Icon name="pin" size={18} />
                {property.neighborhood}, {property.city} – PA · localização aproximada
              </p>
            </div>
            <div className="detail-mobile-actions">
              <button className={`icon-action ${favorite ? "is-favorite" : ""}`} type="button" onClick={() => onFavorite(property.id)} aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={favorite}>
                <Icon name="heart" />
              </button>
              <button className="icon-action" type="button" onClick={share} aria-label="Compartilhar imóvel">
                <Icon name="share" />
              </button>
            </div>
          </div>

          <p className="detail-price">{formatPrice(property)}</p>

          <div className="detail-facts">
            {facts.map(([icon, value, label]) => (
              <div key={label}>
                <Icon name={icon} size={22} />
                <span><strong>{value}</strong><small>{label}</small></span>
              </div>
            ))}
          </div>

          <div className="detail-section">
            <h2>Sobre este imóvel</h2>
            <p>{property.fullDescription}</p>
          </div>

          <div className="detail-section">
            <h2>Diferenciais</h2>
            <ul className="feature-list">
              {property.features.map((feature) => (
                <li key={feature}><span><Icon name="check" size={15} /></span>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="detail-section finance-box">
            <span><Icon name="check" size={20} /></span>
            <div>
              <h2>{property.financeable ? "Financiamento disponível" : "Consulte as condições"}</h2>
              <p>
                {property.financeable
                  ? "A possibilidade de financiamento depende de análise, documentação e aprovação."
                  : "As condições de negociação devem ser confirmadas diretamente no atendimento."}
              </p>
            </div>
          </div>
        </div>

        <aside className="interest-card">
          <p className="eyebrow dark">Atendimento direto</p>
          <h2>{isUnconfirmed ? "Quer confirmar este imóvel?" : "Gostou deste imóvel?"}</h2>
          <p>
            {isUnconfirmed
              ? "Este anúncio é demonstrativo. Confirme disponibilidade, valores e características atuais."
              : "Fale com a equipe e receba informações detalhadas."}
          </p>
          <div className="interest-code">
            <span>Código do imóvel</span>
            <strong>{property.id}</strong>
          </div>
          <a className="button button-primary button-full" href={whatsappFor(property)} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" size={19} /> Consultar informações
          </a>
          <a className="button button-outline button-full" href={whatsappFor(property, isUnconfirmed ? "availability" : "visit")} target="_blank" rel="noreferrer">
            {isUnconfirmed ? "Confirmar disponibilidade" : "Agendar visita"}
          </a>
          <div className="interest-secondary">
            <button type="button" onClick={() => onFavorite(property.id)} aria-pressed={favorite}>
              <Icon name="heart" size={17} /> {favorite ? "Salvo nos favoritos" : "Salvar favorito"}
            </button>
            <button type="button" onClick={share}>
              <Icon name="share" size={17} /> Compartilhar link
            </button>
          </div>
          <small>Ao continuar, você será direcionado para atendimento pelo WhatsApp.</small>
        </aside>
      </section>
    </main>
  );
}
