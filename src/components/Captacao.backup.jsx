"use client";

import { useState } from "react";
import { Icon } from "./Icons";

const RECENT_FORMS = [
  {
    id: "mock-pacos-opala",
    image: "/captacao/mock-pacos-opala.jpg",
    title: "Casa 16 — Condomínio Paços de Opala",
    updatedAt: "Atualizada há 2h",
    status: "Rascunho",
    statusClass: "draft",
  },
  {
    id: "mock-imperial-park",
    image: "/captacao/mock-imperial-park.jpg",
    title: "Casa — Imperial Park",
    updatedAt: "Atualizada há 1 dia",
    status: "Em revisão",
    statusClass: "review",
  },
  {
    id: "mock-rio-pizon",
    image: "/captacao/mock-rio-pizon.jpg",
    title: "Lote — Rio Pizon",
    updatedAt: "Atualizada há 3 dias",
    status: "Concluída",
    statusClass: "done",
  },
];

const PROPERTY_TYPES = ["Casa", "Apartamento", "Terreno", "Comercial", "Chácara", "Fazenda", "Outro"];
const PURPOSES = ["Venda", "Locação", "Venda ou locação"];
const DIFFERENTIALS = ["Piscina", "Energia solar", "Planejados", "Poço artesiano", "Churrasqueira"];

const INITIAL_FORM = {
  propertyType: "",
  purpose: "",
  owner: "",
  phone: "",
  neighborhood: "",
  condominium: "",
  address: "",
  bedrooms: "",
  suites: "",
  bathrooms: "",
  builtArea: "",
  landArea: "",
  parkingSpaces: "",
  notes: "",
};

function CaptureBotanicalCorner({ className = "" }) {
  return <img className={`capture-botanical-corner ${className}`} src="/captacao/capture-hero-plant.jpg" alt="" aria-hidden="true" />;
}

export function CaptacaoDashboard({ onNewForm }) {
  const [notice, setNotice] = useState("");

  return (
    <section className="capture-page capture-dashboard" aria-label="Captação de imóveis">
      <section className="capture-brand-intro">
        <div className="container capture-brand-intro-inner">
          <img className="capture-brand-sprig" src="/captacao/capture-hero-plant.jpg" alt="" aria-hidden="true" />
          <h1>Alyne Crisóstomo</h1>
          <p>CAPTAÇÃO DE IMÓVEIS</p>
        </div>
      </section>

      <section className="capture-content">
        <div className="container capture-container">
          <article className="capture-primary-card">
            <div className="capture-primary-visual">
              <img src="/captacao/capture-hero-plant.jpg" alt="Planta em ambiente claro e acolhedor" />
            </div>
            <div className="capture-primary-copy">
              <h2>Criar nova ficha<br />de captação</h2>
              <button className="capture-new-button" type="button" onClick={onNewForm}>
                <span aria-hidden="true">＋</span> Nova Ficha
              </button>
              <button className="capture-import-button" type="button" onClick={() => setNotice("A importação será adicionada em uma próxima etapa.")}>
                <Icon name="copy" size={19} /> Importar ficha
              </button>
            </div>
          </article>

          {notice ? <p className="capture-notice" role="status">{notice}</p> : null}

          <div className="capture-section-heading">
            <h2>Fichas recentes</h2>
            <span>Dados de demonstração</span>
          </div>

          <div className="capture-recent-list">
            {RECENT_FORMS.map((item) => (
              <article className="capture-recent-card" key={item.id}>
                <img className="capture-thumbnail" src={item.image} alt="Imagem demonstrativa do imóvel" />
                <div className="capture-recent-copy">
                  <h3>{item.title}</h3>
                  <small>{item.updatedAt}</small>
                </div>
                <div className="capture-recent-meta">
                  <button type="button" aria-label={`Mais opções para ${item.title}`} onClick={() => setNotice("Este menu é apenas visual nesta versão de teste.")}>
                    <Icon name="menu" size={18} />
                  </button>
                  <span className={`capture-status is-${item.statusClass}`}>{item.status}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
        <CaptureBotanicalCorner className="is-left" />
        <CaptureBotanicalCorner className="is-right" />
      </section>
    </section>
  );
}

export function CaptacaoForm({ onBack, onContinue, initialDraft }) {
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM, ...(initialDraft?.form || {}) }));
  const [differentials, setDifferentials] = useState(() => ({ ...(initialDraft?.differentials || {}) }));
  const [notice, setNotice] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setNotice("");
  }

  function saveDraft() {
    setNotice("Rascunho salvo apenas nesta versão de teste.");
  }

  function continueForm(event) {
    event.preventDefault();
    onContinue?.({ form, differentials });
  }

  return (
    <section className="capture-page capture-form-page" aria-label="Nova ficha de captação">
      <div className="container capture-form-container">
        <header className="capture-form-topbar">
          <button type="button" onClick={onBack} aria-label="Voltar para Captação">
            <Icon className="capture-back-icon" name="arrow" size={20} />
          </button>
          <h1>Nova Ficha de Captação</h1>
          <img className="capture-topbar-leaf" src="/captacao/capture-hero-plant.jpg" alt="" aria-hidden="true" />
        </header>

        <ol className="capture-steps" aria-label="Etapas da ficha">
          <li className="is-active"><span>1</span><small>Identificação</small></li>
          <li><span>2</span><small>Detalhes</small></li>
          <li><span>3</span><small>Mídia</small></li>
          <li><span>4</span><small>Revisão</small></li>
        </ol>

        <form className="capture-form" onSubmit={continueForm}>
          <section className="capture-form-section" aria-labelledby="capture-main-data">
            <div className="capture-form-section-heading">
              <Icon name="pin" size={20} />
              <h2 id="capture-main-data">Dados principais</h2>
            </div>

            <div className="capture-fields-grid">
              <label>
                <span>Tipo do imóvel</span>
                <select name="propertyType" value={form.propertyType} onChange={updateField} required>
                  <option value="">Selecione</option>
                  {PROPERTY_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span>Finalidade</span>
                <select name="purpose" value={form.purpose} onChange={updateField} required>
                  <option value="">Selecione</option>
                  {PURPOSES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="capture-field-wide">
                <span>Proprietário</span>
                <input name="owner" value={form.owner} onChange={updateField} placeholder="Nome completo" autoComplete="off" />
              </label>
              <label>
                <span>Telefone</span>
                <input name="phone" value={form.phone} onChange={updateField} placeholder="(94) 99999-9999" inputMode="tel" autoComplete="tel" />
              </label>
              <label>
                <span>Bairro</span>
                <input name="neighborhood" value={form.neighborhood} onChange={updateField} placeholder="Digite o bairro" autoComplete="address-level3" />
              </label>
              <label>
                <span>Condomínio</span>
                <input name="condominium" value={form.condominium} onChange={updateField} placeholder="Digite o condomínio" autoComplete="off" />
              </label>
              <label>
                <span>Endereço</span>
                <input name="address" value={form.address} onChange={updateField} placeholder="Rua, número, complemento" autoComplete="street-address" />
              </label>
            </div>
          </section>

          <section className="capture-form-section" aria-labelledby="capture-features">
            <div className="capture-form-section-heading">
              <Icon name="area" size={20} />
              <h2 id="capture-features">Características do imóvel</h2>
            </div>

            <div className="capture-number-grid">
              <label><span>Quartos</span><input type="number" min="0" inputMode="numeric" name="bedrooms" value={form.bedrooms} onChange={updateField} placeholder="0" /></label>
              <label><span>Suítes</span><input type="number" min="0" inputMode="numeric" name="suites" value={form.suites} onChange={updateField} placeholder="0" /></label>
              <label><span>Banheiros</span><input type="number" min="0" inputMode="numeric" name="bathrooms" value={form.bathrooms} onChange={updateField} placeholder="0" /></label>
              <label><span>Área construída (m²)</span><input type="number" min="0" inputMode="decimal" name="builtArea" value={form.builtArea} onChange={updateField} placeholder="0,00" /></label>
              <label><span>Área do terreno (m²)</span><input type="number" min="0" inputMode="decimal" name="landArea" value={form.landArea} onChange={updateField} placeholder="0,00" /></label>
              <label><span>Vagas de garagem</span><input type="number" min="0" inputMode="numeric" name="parkingSpaces" value={form.parkingSpaces} onChange={updateField} placeholder="0" /></label>
            </div>
          </section>

          <section className="capture-form-section capture-differentials" aria-labelledby="capture-differentials">
            <h2 id="capture-differentials" className="sr-only">Diferenciais</h2>
            <div className="capture-chip-grid">
              {DIFFERENTIALS.map((item) => (
                <fieldset key={item}>
                  <legend>{item}</legend>
                  <div>
                    <button className={differentials[item] === true ? "is-selected" : ""} type="button" aria-pressed={differentials[item] === true} onClick={() => setDifferentials((current) => ({ ...current, [item]: true }))}>Sim</button>
                    <button className={differentials[item] === false ? "is-selected" : ""} type="button" aria-pressed={differentials[item] === false} onClick={() => setDifferentials((current) => ({ ...current, [item]: false }))}>Não</button>
                  </div>
                </fieldset>
              ))}
            </div>
          </section>

          <section className="capture-form-section capture-notes-section" aria-labelledby="capture-notes">
            <label className="capture-notes-field">
              <span id="capture-notes">Observações</span>
              <textarea name="notes" value={form.notes} onChange={updateField} placeholder="Adicione informações relevantes sobre o imóvel..." rows="5" maxLength="500" />
              <small>{form.notes.length}/500</small>
            </label>
          </section>

          {notice ? <p className="capture-form-notice" role="status">{notice}</p> : null}

          <div className="capture-form-actions">
            <button className="capture-save-button" type="button" onClick={saveDraft}><Icon name="copy" size={18} /> Salvar rascunho</button>
            <button className="capture-continue-button" type="submit">Continuar <Icon name="arrow" size={18} /></button>
          </div>
        </form>
      </div>
    </section>
  );
}

export function CaptacaoSummary({ draft, onBack, onEdit }) {
  const [notice, setNotice] = useState("");
  const form = { ...INITIAL_FORM, ...(draft?.form || {}) };
  const differentials = draft?.differentials || {};
  const selectedDifferentials = DIFFERENTIALS.filter((item) => differentials[item] === true);
  const location = [form.condominium, form.neighborhood].filter(Boolean).join(" • ");
  const features = [
    form.bedrooms ? { icon: "bed", label: `${form.bedrooms} quarto${String(form.bedrooms) === "1" ? "" : "s"}` } : null,
    form.suites ? { icon: "bed", label: `${form.suites} suíte${String(form.suites) === "1" ? "" : "s"}` } : null,
    form.bathrooms ? { icon: "bath", label: `${form.bathrooms} banheiro${String(form.bathrooms) === "1" ? "" : "s"}` } : null,
    form.parkingSpaces ? { icon: "car", label: `${form.parkingSpaces} vaga${String(form.parkingSpaces) === "1" ? "" : "s"}` } : null,
  ].filter(Boolean);

  function showFutureNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  return (
    <section className="capture-page capture-form-page capture-summary-page" aria-label="Resumo da ficha de captação">
      <div className="container capture-form-container capture-summary-container">
        <header className="capture-form-topbar">
          <button type="button" onClick={onBack} aria-label="Voltar para Captação">
            <Icon className="capture-back-icon" name="arrow" size={20} />
          </button>
          <h1>Resumo da Ficha</h1>
          <img className="capture-topbar-leaf" src="/captacao/capture-hero-plant.jpg" alt="" aria-hidden="true" />
        </header>

        <div className="capture-summary-banner" role="status">
          <span><Icon name="check" size={18} /></span>
          <div>
            <strong>Ficha padrão gerada</strong>
            <small>Revise as informações antes de finalizar.</small>
          </div>
          <img src="/captacao/capture-hero-plant.jpg" alt="" aria-hidden="true" />
        </div>

        <article className="capture-summary-groups">
          <section className="capture-summary-section" aria-labelledby="summary-main-data">
            <header className="capture-summary-heading">
              <Icon name="pin" size={18} />
              <h2 id="summary-main-data">Dados principais</h2>
              <button type="button" onClick={onEdit}>Editar <Icon name="arrow" size={14} /></button>
            </header>
            <div className="capture-summary-data">
              <p><strong>{form.propertyType || "Tipo não informado"}</strong><span>•</span>{form.purpose || "Finalidade não informada"}</p>
              <p>Proprietário: {form.owner || "Não informado"}</p>
              {form.phone ? <p>Telefone: {form.phone}</p> : null}
              <p>{location || "Bairro ou condomínio não informado"}</p>
              {form.address ? <p>{form.address}</p> : null}
            </div>
          </section>

          <section className="capture-summary-section" aria-labelledby="summary-features">
            <header className="capture-summary-heading">
              <Icon name="area" size={18} />
              <h2 id="summary-features">Características</h2>
              <button type="button" onClick={onEdit}>Editar <Icon name="arrow" size={14} /></button>
            </header>
            {features.length ? (
              <div className="capture-summary-features">
                {features.map((item) => <span key={item.label}><Icon name={item.icon} size={15} />{item.label}</span>)}
              </div>
            ) : <p className="capture-summary-empty">Nenhuma quantidade informada.</p>}
            <div className="capture-summary-data is-compact">
              <p>Área construída: {form.builtArea ? `${form.builtArea} m²` : "Não informada"}</p>
              <p>Área do terreno: {form.landArea ? `${form.landArea} m²` : "Não informada"}</p>
            </div>
          </section>

          <section className="capture-summary-section" aria-labelledby="summary-comforts">
            <header className="capture-summary-heading">
              <Icon name="spark" size={18} />
              <h2 id="summary-comforts">Comodidades</h2>
              <button type="button" onClick={onEdit}>Editar <Icon name="arrow" size={14} /></button>
            </header>
            {selectedDifferentials.length ? (
              <div className="capture-summary-comforts">
                {selectedDifferentials.map((item) => <span key={item}><i><Icon name="check" size={11} /></i>{item}</span>)}
              </div>
            ) : <p className="capture-summary-empty">Nenhum diferencial selecionado.</p>}
          </section>

          <section className="capture-summary-section" aria-labelledby="summary-notes">
            <header className="capture-summary-heading">
              <Icon name="copy" size={18} />
              <h2 id="summary-notes">Observações</h2>
              <button type="button" onClick={onEdit}>Editar <Icon name="arrow" size={14} /></button>
            </header>
            <p className="capture-summary-notes">{form.notes || "Nenhuma observação adicionada."}</p>
          </section>
        </article>

        <article className="capture-summary-preview">
          <span className="capture-summary-preview-icon"><Icon name="copy" size={24} /></span>
          <div>
            <strong>Pré-visualização da ficha</strong>
            <p>Resumo local pronto para conferência.</p>
            <small>Rascunho • Sem persistência nesta etapa</small>
          </div>
          <CaptureBotanicalCorner />
        </article>

        <div className="capture-summary-actions">
          <button type="button" onClick={onEdit}><Icon name="copy" size={17} /> Editar</button>
          <button type="button" disabled aria-disabled="true"><Icon name="copy" size={17} /> Gerar PDF <small>em breve</small></button>
        </div>

        <button className="capture-summary-primary" type="button" onClick={() => showFutureNotice("A ficha foi revisada. O cadastro permanente será conectado em uma próxima etapa.")}>
          Finalizar revisão <Icon name="arrow" size={18} />
        </button>

        {notice ? <p className="capture-summary-notice" role="status">{notice}</p> : null}
      </div>
    </section>
  );
}
