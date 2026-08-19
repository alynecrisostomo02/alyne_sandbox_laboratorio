"use client";

import { SITE_CONFIG } from "../config";
import { navigate, whatsappFor } from "../utils";
import { Icon } from "./Icons";

export function About() {
  return (
    <main>
      <section className="page-banner">
        <div className="container narrow">
          <p className="eyebrow">Sobre a corretora</p>
          <h1>Imóveis com contexto. Atendimento com proximidade.</h1>
          <p>Uma atuação local, cuidadosa e centrada no que faz sentido para cada cliente.</p>
        </div>
      </section>
      <section className="section">
        <div className="container about-layout">
          <div className="about-visual" aria-hidden="true">
            <span className="about-arch" />
            <span className="about-sun" />
            <span className="about-line one" />
            <span className="about-line two" />
            <small>Redenção · Pará</small>
          </div>
          <div className="about-copy">
            <p className="eyebrow dark">Nosso jeito de atender</p>
            <h2>Uma conversa clara do primeiro contato à decisão.</h2>
            <p>{SITE_CONFIG.about}</p>
            <p>
              A proposta é facilitar sua busca com informações objetivas e um atendimento
              humano para confirmar cada detalhe antes da decisão.
            </p>
            <div className="values-list">
              <div><span><Icon name="check" size={16} /></span><p><strong>Informação objetiva</strong><small>O essencial apresentado de forma organizada.</small></p></div>
              <div><span><Icon name="check" size={16} /></span><p><strong>Atendimento próximo</strong><small>Contato direto e atenção ao seu perfil.</small></p></div>
              <div><span><Icon name="check" size={16} /></span><p><strong>Conhecimento da região</strong><small>Busca orientada para a realidade de Redenção.</small></p></div>
            </div>
            <button className="button button-primary" type="button" onClick={() => navigate("#/contato")}>
              Entre em contato <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export function Contact() {
  return (
    <main>
      <section className="page-banner">
        <div className="container narrow">
          <p className="eyebrow">Contato</p>
          <h1>Vamos conversar sobre o imóvel que você procura.</h1>
          <p>Escolha o canal de atendimento e fale diretamente com a equipe.</p>
        </div>
      </section>
      <section className="section">
        <div className="container contact-layout">
          <div className="contact-main">
            <p className="eyebrow dark">Atendimento direto</p>
            <h2>Conte o que você precisa.</h2>
            <p>
              Nesta primeira versão, não coletamos seus dados no site.
              O atendimento continua em um canal que você já conhece.
            </p>
            <a className="button button-primary" href={whatsappFor()} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" size={20} /> Falar no WhatsApp
            </a>
            <small className="redirect-note">
              Ao continuar, você será direcionado para atendimento pelo WhatsApp.
            </small>
          </div>
          <dl className="contact-list">
            <div>
              <dt>WhatsApp</dt>
              <dd>
                <a href={whatsappFor()} target="_blank" rel="noreferrer">
                  {SITE_CONFIG.whatsappDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>
                <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noreferrer">
                  {SITE_CONFIG.instagram}
                </a>
              </dd>
            </div>
            {SITE_CONFIG.email && (
              <div>
                <dt>E-mail</dt>
                <dd><a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a></dd>
              </div>
            )}
            <div>
              <dt>Cidade de atendimento</dt>
              <dd>{SITE_CONFIG.city}</dd>
            </div>
            <div>
              <dt>Horário de atendimento</dt>
              <dd>{SITE_CONFIG.hours}</dd>
            </div>
            {SITE_CONFIG.creci && (
              <div>
                <dt>Registro profissional</dt>
                <dd>CRECI: {SITE_CONFIG.creci}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </main>
  );
}
