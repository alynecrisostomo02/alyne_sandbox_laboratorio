import { SITE_CONFIG } from "../config";
import { navigate, whatsappFor } from "../utils";
import { Icon } from "./Icons";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <span className="context-brand-logo footer-brand-logo">
              <img src="/branding/logo-alyne-padrao.jpg" alt="Alyne Crisóstomo — Corretora de Imóveis" />
            </span>
          </div>
          <p>
            Atendimento imobiliário próximo e transparente em {SITE_CONFIG.city}.
          </p>
          {SITE_CONFIG.creci && <small>CRECI: {SITE_CONFIG.creci}</small>}
        </div>
        <div>
          <h2>Navegação</h2>
          <button type="button" onClick={() => navigate("#/imoveis")}>Imóveis</button>
          <button type="button" onClick={() => navigate("#/encontrar")}>Encontrar meu imóvel</button>
          <button type="button" onClick={() => navigate("#/sobre")}>Sobre</button>
          <button type="button" onClick={() => navigate("#/contato")}>Contato</button>
        </div>
        <div>
          <h2>Atendimento</h2>
          <p>{SITE_CONFIG.city}</p>
          <p>{SITE_CONFIG.hours}</p>
          <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noreferrer">
            {SITE_CONFIG.instagram}
          </a>
          <a href={whatsappFor()} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" size={18} /> Iniciar conversa
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 {SITE_CONFIG.brandName}</span>
        <span>Disponibilidade, valores e condições sujeitos a confirmação</span>
      </div>
    </footer>
  );
}
