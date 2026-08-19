"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "../config";
import { navigate, whatsappFor } from "../utils";
import { Icon } from "./Icons";

const links = [
  ["Início", "#/"],
  ["Imóveis", "#/imoveis"],
  ["Encontrar meu imóvel", "#/encontrar"],
  ["Assistente Crisostomo", "#/assistente"],
  ["Sobre", "#/sobre"],
];

export default function Header({ route }) {
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [route]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <button
          className="brand brand-logo"
          type="button"
          onClick={() => navigate("#/")}
          aria-label="Alyne Crisóstomo - página inicial"
        >
          <span className="brand-organic" aria-hidden="true"></span>
          <img
            className="brand-logo-image"
            src="/branding/logo-alyne-padrao.jpg"
            alt="Alyne Crisóstomo — Corretora de Imóveis"
          />
        </button>

        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Navegação principal">
          {links.map(([label, hash]) => {
            const active = hash === "#/"
              ? route === "/"
              : route.startsWith(hash.slice(1));
            return (
              <button
                type="button"
                key={hash}
                className={active ? "active" : ""}
                onClick={() => navigate(hash)}
              >
                {label}
              </button>
            );
          })}
          <a
            className="button button-primary nav-whatsapp"
            href={whatsappFor()}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="whatsapp" size={18} /> Falar no WhatsApp
          </a>
        </nav>

        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? "close" : "menu"} size={24} />
        </button>
      </div>
    </header>
  );
}
