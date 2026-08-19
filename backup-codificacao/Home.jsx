"use client";

import { useState } from "react";
import { properties, typeLabels } from "../properties";
import { navigate, whatsappFor } from "../utils";
import { Icon } from "./Icons";
import PropertyCard from "./PropertyCard";

export default function Home({ favorites, onFavorite }) {
  const [quick, setQuick] = useState({
    purpose: "",
    type: "",
    price: "",
    bedrooms: "",
  });

  function update(field, value) {
    setQuick((current) => ({ ...current, [field]: value }));
  }

  function search(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(quick).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`#/imoveis${params.toString() ? `?${params}` : ""}`);
  }

  const featured = properties.filter((item) => item.featured && item.status !== "Arquivado").slice(0, 3);

  return (
    <main>
      <section className="hero">
        <div className="hero-pattern" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">ImÃ³veis em RedenÃ§Ã£o â€“ PA</p>
            <h1>Encontre o imÃ³vel certo para o seu momento.</h1>
            <p className="hero-lead">
              ImÃ³veis para venda e locaÃ§Ã£o em RedenÃ§Ã£o, com atendimento prÃ³ximo,
              informaÃ§Ãµes claras e opÃ§Ãµes selecionadas para vocÃª.
            </p>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={() => navigate("#/imoveis")}>
                Ver imÃ³veis <Icon name="arrow" size={18} />
              </button>
              <button className="button button-light" type="button" onClick={() => navigate("#/encontrar")}>
                Ajude-me a escolher
              </button>
            </div>
            <p className="demo-note light-note">
              VersÃ£o demonstrativa: imÃ³veis, valores e condiÃ§Ãµes estÃ£o em validaÃ§Ã£o. Confirme tudo no atendimento.
            </p>
          </div>
          <div className="hero-visual" role="img" aria-label="ComposiÃ§Ã£o arquitetÃ´nica abstrata em tons naturais">
            <div className="hero-house">
              <span className="house-roof" />
              <span className="house-wall" />
              <span className="house-window one" />
              <span className="house-window two" />
              <span className="house-door" />
            </div>
            <div className="hero-card">
              <span>Atendimento local</span>
              <strong>RedenÃ§Ã£o, ParÃ¡</strong>
              <small>Conhecimento da regiÃ£o, conversa direta.</small>
            </div>
          </div>
        </div>
        <div className="container">
          <form className="quick-search" onSubmit={search}>
            <div>
              <label htmlFor="quick-purpose">Comprar ou alugar</label>
              <select id="quick-purpose" value={quick.purpose} onChange={(e) => update("purpose", e.target.value)}>
                <option value="">Todos</option>
                <option value="venda">Comprar</option>
                <option value="locacao">Alugar</option>
              </select>
            </div>
            <div>
              <label htmlFor="quick-type">Tipo do imÃ³vel</label>
              <select id="quick-type" value={quick.type} onChange={(e) => update("type", e.target.value)}>
                <option value="">Todos os tipos</option>
                {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="quick-price">Faixa de preÃ§o</label>
              <select id="quick-price" value={quick.price} onChange={(e) => update("price", e.target.value)}>
                <option value="">Qualquer valor</option>
                <option value="3000">AtÃ© R$ 3 mil</option>
                <option value="5000">AtÃ© R$ 5 mil</option>
                <option value="8000">AtÃ© R$ 8 mil</option>
                <option value="350000">AtÃ© R$ 350 mil</option>
                <option value="600000">AtÃ© R$ 600 mil</option>
                <option value="900000">AtÃ© R$ 900 mil</option>
                <option value="1300000">AtÃ© R$ 1,3 milhÃ£o</option>
              </select>
            </div>
            <div>
              <label htmlFor="quick-bedrooms">Quartos</label>
              <select id="quick-bedrooms" value={quick.bedrooms} onChange={(e) => update("bedrooms", e.target.value)}>
                <option value="">Qualquer</option>
                <option value="1">1 ou mais</option>
                <option value="2">2 ou mais</option>
                <option value="3">3 ou mais</option>
                <option value="4">4 ou mais</option>
              </select>
            </div>
            <button className="button button-gold" type="submit">
              <Icon name="search" size={19} /> Buscar imÃ³veis
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow dark">SeleÃ§Ã£o inicial</p>
              <h2>ImÃ³veis em destaque</h2>
              <p>OpÃ§Ãµes selecionadas do catÃ¡logo fornecido para vocÃª comeÃ§ar a explorar.</p>
            </div>
            <button className="text-link" type="button" onClick={() => navigate("#/imoveis")}>
              Ver catÃ¡logo completo <Icon name="arrow" size={17} />
            </button>
          </div>
          <div className="property-grid">
            {featured.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                favorite={favorites.includes(property.id)}
                onFavorite={onFavorite}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container service-grid">
          <div className="service-intro">
            <p className="eyebrow dark">Uma busca mais simples</p>
            <h2>Clareza em cada etapa.</h2>
            <p>
              Filtre com autonomia, compare as informaÃ§Ãµes essenciais e fale
              diretamente com quem conhece a regiÃ£o.
            </p>
          </div>
          <article className="service-card">
            <span className="number">01</span>
            <h3>OpÃ§Ãµes organizadas</h3>
            <p>Dados objetivos para comparar imÃ³veis sem excesso de informaÃ§Ã£o.</p>
          </article>
          <article className="service-card">
            <span className="number">02</span>
            <h3>Atendimento humano</h3>
            <p>Conversa direta pelo WhatsApp, com uma mensagem jÃ¡ preparada.</p>
          </article>
          <article className="service-card">
            <span className="number">03</span>
            <h3>Conhecimento local</h3>
            <p>Uma experiÃªncia pensada para quem busca imÃ³veis em RedenÃ§Ã£o.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container guided-cta">
          <div>
            <p className="eyebrow">Busca guiada</p>
            <h2>NÃ£o sabe por onde comeÃ§ar?</h2>
            <p>Responda seis perguntas rÃ¡pidas e veja as opÃ§Ãµes mais compatÃ­veis.</p>
          </div>
          <button className="button button-gold" type="button" onClick={() => navigate("#/encontrar")}>
            Vamos encontrar <Icon name="arrow" size={18} />
          </button>
        </div>
      </section>

      <section className="local-cta">
        <div className="container local-cta-inner">
          <div>
            <p className="eyebrow">Atendimento em RedenÃ§Ã£o</p>
            <h2>Seu prÃ³ximo passo comeÃ§a com uma boa conversa.</h2>
          </div>
          <a className="button button-light" href={whatsappFor()} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" size={20} /> Falar no WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}

