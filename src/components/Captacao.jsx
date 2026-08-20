"use client";

import { useEffect, useState, useMemo } from "react";
import { Icon } from "./Icons";
import { CaptacaoImportModal } from "./CaptacaoImportModal";
import { downloadCaptacaoPdf } from "../propertyPdf";
import {
  fetchAddressByCep,
  formatCep,
  cleanCepDigits,
  determineZone,
  getCoordinatesForAddress,
} from "../utils/addressGeocoding";

const PROPERTY_TYPES = ["Casa", "Apartamento", "Terreno", "Comercial", "Chácara", "Fazenda", "Outro"];
const PURPOSES = ["Venda", "Locação", "Venda ou locação"];
const DIFFERENTIALS = ["Piscina", "Energia solar", "Planejados", "Poço artesiano", "Churrasqueira"];

const INITIAL_FORM = {
  propertyType: "",
  purpose: "",
  owner: "",
  phone: "",
  cep: "",
  neighborhood: "",
  condominium: "",
  address: "",
  zone: "",
  city: "Redenção",
  state: "PA",
  latitude: "",
  longitude: "",
  bedrooms: "",
  suites: "",
  bathrooms: "",
  builtArea: "",
  landArea: "",
  parkingSpaces: "",
  notes: "",
};

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function CaptureBotanicalCorner({ className = "" }) {
  return (
    <img
      className={`capture-botanical-corner ${className}`}
      src="/captacao/capture-hero-plant.jpg"
      alt=""
      aria-hidden="true"
    />
  );
}

export function CaptacaoDashboard({ onNewForm, onSelectForm }) {
  const [notice, setNotice] = useState("");
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importInitialTab, setImportInitialTab] = useState("image");
  const [isImportDropdownOpen, setIsImportDropdownOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadForms() {
      try {
        const response = await fetch("/api/admin/captacao", {
          credentials: "same-origin",
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error("Não foi possível carregar as fichas.");
        }

        if (active) {
          setForms(Array.isArray(result.forms) ? result.forms : []);
        }
      } catch (error) {
        if (active) {
          setNotice(error?.message || "Não foi possível carregar as fichas.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadForms();

    return () => {
      active = false;
    };
  }, []);

  function handleImportData(importedData) {
    onNewForm?.(importedData);
  }

  // Estatísticas rápidas
  const completedCount = forms.filter((f) => f.status === "completed").length;
  const draftCount = forms.filter((f) => f.status !== "completed").length;

  return (
    <section className="capture-page capture-dashboard" aria-label="Captação de imóveis">
      <section className="capture-brand-intro">
        <div className="container capture-brand-intro-inner">
          <img
            className="capture-brand-sprig"
            src="/captacao/capture-hero-plant.jpg"
            alt=""
            aria-hidden="true"
          />
          <h1>Alyne Crisóstomo</h1>
          <p>CAPTAÇÃO INTELIGENTE DE IMÓVEIS</p>
        </div>
      </section>

      <section className="capture-content">
        <div className="container capture-container">
          {/* Card Principal de Ação com Botões de Nova Ficha e Menu Dropdown de Importação */}
          <article className="capture-primary-card">
            <div className="capture-primary-visual">
              <img
                src="/captacao/capture-hero-plant.jpg"
                alt="Planta em ambiente claro e acolhedor"
              />
            </div>
            <div className="capture-primary-copy">
              <div className="capture-primary-header-text">
                <h2>
                  Criar nova ficha<br />de captação
                </h2>
                <p>Cadastre manualmente ou importe direto de conversas, planilhas e formulários.</p>
              </div>

              <div className="capture-primary-actions-row">
                <button
                  className="capture-new-button"
                  type="button"
                  onClick={() => onNewForm?.(null)}
                >
                  <span aria-hidden="true">＋</span> Nova Ficha em Branco
                </button>

                <div className="capture-import-dropdown-wrap">
                  <button
                    className="capture-import-button"
                    type="button"
                    onClick={() => {
                      setImportInitialTab("image");
                      setIsImportModalOpen(true);
                    }}
                    title="Importar ficha a partir de fotos, textos, Google Drive ou Google Forms"
                  >
                    <Icon name="spark" size={18} />
                    <span>Importar ficha</span>
                    <span
                      className="capture-import-dropdown-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsImportDropdownOpen(!isImportDropdownOpen);
                      }}
                      title="Opções de importação"
                    >
                      <Icon name="chevron" size={14} />
                    </span>
                  </button>

                  {isImportDropdownOpen && (
                    <div
                      className="capture-import-dropdown-menu"
                      onClick={() => setIsImportDropdownOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setImportInitialTab("image");
                          setIsImportModalOpen(true);
                        }}
                      >
                        <Icon name="camera" size={16} />
                        <div>
                          <strong>Foto / Imagem (IA Gratuita)</strong>
                          <small>Extraia dados de fotos e prints com Gemini</small>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImportInitialTab("text");
                          setIsImportModalOpen(true);
                        }}
                      >
                        <Icon name="fileText" size={16} />
                        <div>
                          <strong>Texto / WhatsApp</strong>
                          <small>Cole mensagens e anotações brutas</small>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImportInitialTab("drive");
                          setIsImportModalOpen(true);
                        }}
                      >
                        <Icon name="drive" size={16} />
                        <div>
                          <strong>Google Drive</strong>
                          <small>Docs, planilhas e arquivos do Drive</small>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImportInitialTab("forms");
                          setIsImportModalOpen(true);
                        }}
                      >
                        <Icon name="forms" size={16} />
                        <div>
                          <strong>Google Forms</strong>
                          <small>Respostas de formulários da imobiliária</small>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Badges de Destaque das Fontes de Importação */}
              <div className="capture-import-sources-badges">
                <span
                  className="capture-source-tag is-ai"
                  onClick={() => {
                    setImportInitialTab("image");
                    setIsImportModalOpen(true);
                  }}
                >
                  <Icon name="spark" size={13} /> Foto / Imagem (IA)
                </span>
                <span
                  className="capture-source-tag"
                  onClick={() => {
                    setImportInitialTab("text");
                    setIsImportModalOpen(true);
                  }}
                >
                  <Icon name="fileText" size={13} /> Texto / WhatsApp
                </span>
                <span
                  className="capture-source-tag"
                  onClick={() => {
                    setImportInitialTab("drive");
                    setIsImportModalOpen(true);
                  }}
                >
                  <Icon name="drive" size={13} /> Google Drive
                </span>
                <span
                  className="capture-source-tag"
                  onClick={() => {
                    setImportInitialTab("forms");
                    setIsImportModalOpen(true);
                  }}
                >
                  <Icon name="forms" size={13} /> Google Forms
                </span>
              </div>
            </div>
          </article>

          {/* Mini-dashboard de Métricas de Captação */}
          <div className="capture-metrics-strip">
            <div className="capture-metric-card">
              <span className="capture-metric-num">{forms.length}</span>
              <span className="capture-metric-label">Total de Fichas</span>
            </div>
            <div className="capture-metric-card is-success">
              <span className="capture-metric-num">{completedCount}</span>
              <span className="capture-metric-label">Concluídas / Salvas</span>
            </div>
            <div className="capture-metric-card is-draft">
              <span className="capture-metric-num">{draftCount}</span>
              <span className="capture-metric-label">Rascunhos em Edição</span>
            </div>
          </div>

          {notice ? (
            <p className="capture-notice" role="status">
              {notice}
            </p>
          ) : null}

          <div className="capture-section-heading">
            <div>
              <h2>Fichas recentes</h2>
              <small>Histórico de captações realizadas</small>
            </div>
            <span>
              {loading ? "Carregando..." : `${forms.length} ficha${forms.length === 1 ? "" : "s"}`}
            </span>
          </div>

          <div className="capture-recent-list">
            {loading ? (
              <div className="capture-loading-state">
                <Icon name="refresh" size={24} />
                <p>Carregando fichas de captação...</p>
              </div>
            ) : forms.length === 0 ? (
              <div className="capture-empty-card">
                <Icon name="fileText" size={32} />
                <h3>Nenhuma ficha salva ainda</h3>
                <p>
                  Clique em <strong>Nova Ficha</strong> para iniciar ou utilize a opção{" "}
                  <strong>Importar Ficha</strong> para preencher com dados do WhatsApp, Drive ou Google Forms.
                </p>
              </div>
            ) : (
              forms.map((item) => {
                const data = item.form || {};
                const title =
                  [
                    data.propertyType,
                    data.condominium || data.neighborhood || data.address,
                  ]
                    .filter(Boolean)
                    .join(" • ") || "Ficha de captação";

                const isCompleted = item.status === "completed";
                const status = isCompleted
                  ? "Concluída"
                  : item.status === "review"
                  ? "Em revisão"
                  : "Rascunho";

                const statusClass = isCompleted
                  ? "done"
                  : item.status === "review"
                  ? "review"
                  : "draft";

                const updatedAt = item.updatedAt
                  ? new Date(item.updatedAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Sem data";

                return (
                  <article className="capture-recent-card" key={item.id}>
                    <div className="capture-thumbnail" aria-hidden="true">
                      <Icon name="fileText" size={24} />
                    </div>
                    <div className="capture-recent-copy">
                      <h3>{title}</h3>
                      <p className="capture-recent-owner">
                        {data.owner ? `Proprietário: ${data.owner}` : "Proprietário não informado"}
                        {data.phone ? ` • ${data.phone}` : ""}
                      </p>
                      <small>Atualizada em {updatedAt}</small>
                    </div>
                    <div className="capture-recent-meta">
                      <span className={`capture-status is-${statusClass}`}>{status}</span>
                      <button
                        type="button"
                        className="capture-btn-card-action"
                        onClick={() => onSelectForm?.(item)}
                        title="Ver resumo e opções"
                      >
                        Abrir ficha <Icon name="arrow" size={13} />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
        <CaptureBotanicalCorner className="is-left" />
        <CaptureBotanicalCorner className="is-right" />
      </section>

      {/* Modal de Importação Completo */}
      <CaptacaoImportModal
        isOpen={isImportModalOpen}
        initialTab={importInitialTab}
        onClose={() => setIsImportModalOpen(false)}
        onImportData={handleImportData}
      />
    </section>
  );
}

export function CaptacaoForm({ onBack, onContinue, initialDraft }) {
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    ...(initialDraft?.form || {}),
  }));
  const [differentials, setDifferentials] = useState(() => ({
    ...(initialDraft?.differentials || {}),
  }));
  const [notice, setNotice] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [cepStatus, setCepStatus] = useState({
    loading: false,
    success: false,
    error: "",
    source: "",
    coords: null,
  });

  async function lookupCep(cepToQuery) {
    const clean = cleanCepDigits(cepToQuery);
    if (clean.length !== 8) {
      setCepStatus({
        loading: false,
        success: false,
        error: "Digite o CEP completo com 8 dígitos.",
        source: "",
        coords: null,
      });
      return;
    }

    setCepStatus({ loading: true, success: false, error: "", source: "", coords: null });

    try {
      const data = await fetchAddressByCep(clean);
      if (data && data.valid) {
        setForm((curr) => ({
          ...curr,
          cep: data.cep,
          neighborhood: data.neighborhood || curr.neighborhood,
          address: data.street ? `${data.street}${curr.address ? ` - ${curr.address}` : ""}` : curr.address,
          zone: data.zone || curr.zone,
          city: data.city || "Redenção",
          state: data.state || "PA",
          latitude: data.coordinates?.lat ? String(data.coordinates.lat) : curr.latitude,
          longitude: data.coordinates?.lng ? String(data.coordinates.lng) : curr.longitude,
        }));

        setCepStatus({
          loading: false,
          success: true,
          error: "",
          source: data.source,
          coords: data.coordinates,
        });
        setNotice(`Endereço localizado: ${data.neighborhood || data.city} (${data.zone})`);
      } else {
        setCepStatus({
          loading: false,
          success: false,
          error: "CEP não encontrado. Preencha o bairro manualmente.",
          source: "",
          coords: null,
        });
      }
    } catch {
      setCepStatus({
        loading: false,
        success: false,
        error: "Falha ao consultar CEP. Preencha os campos manualmente.",
        source: "",
        coords: null,
      });
    }
  }

  function handleCepChange(event) {
    const raw = event.target.value;
    const formatted = formatCep(raw);
    setForm((curr) => ({ ...curr, cep: formatted }));
    setNotice("");

    const clean = cleanCepDigits(raw);
    if (clean.length === 8) {
      lookupCep(clean);
    } else if (clean.length < 8) {
      setCepStatus({ loading: false, success: false, error: "", source: "", coords: null });
    }
  }

  function updateField(event) {
    const { name, value } = event.target;
    if (name === "phone") {
      setForm((current) => ({ ...current, phone: formatPhone(value) }));
    } else if (name === "neighborhood") {
      const zone = determineZone(value, form.city || "Redenção");
      const coords = getCoordinatesForAddress({ neighborhood: value, city: form.city });
      setForm((current) => ({
        ...current,
        neighborhood: value,
        zone,
        latitude: coords.lat ? String(coords.lat) : current.latitude,
        longitude: coords.lng ? String(coords.lng) : current.longitude,
      }));
    } else {
      setForm((current) => ({ ...current, [name]: value }));
    }
    setNotice("");
  }

  function handleImportedData(imported) {
    if (imported.form) {
      setForm((current) => ({
        ...current,
        ...imported.form,
      }));
    }
    if (imported.differentials) {
      setDifferentials((current) => ({
        ...current,
        ...imported.differentials,
      }));
    }
    setNotice("Dados importados com sucesso! Revise os campos preenchidos.");
  }

  function saveDraft() {
    try {
      localStorage.setItem(
        "alyne_captacao_draft_active",
        JSON.stringify({ form, differentials, savedAt: new Date().toISOString() })
      );
      setNotice("Rascunho salvo localmente com sucesso.");
    } catch {
      setNotice("Rascunho salvo temporariamente nesta sessão.");
    }
  }

  function continueForm(event) {
    event.preventDefault();
    if (!form.propertyType) {
      setNotice("Por favor, selecione o tipo do imóvel.");
      return;
    }
    if (!form.purpose) {
      setNotice("Por favor, selecione a finalidade (Venda ou Locação).");
      return;
    }
    onContinue?.({ form, differentials });
  }

  // Medidor de progresso de preenchimento
  const fieldsToCheck = [
    form.propertyType,
    form.purpose,
    form.owner,
    form.phone,
    form.neighborhood,
    form.condominium || form.address,
    form.bedrooms,
    form.suites,
    form.bathrooms,
    form.parkingSpaces,
    form.builtArea,
    form.landArea,
  ];
  const filledCount = fieldsToCheck.filter(Boolean).length;
  const progressPercent = Math.round((filledCount / fieldsToCheck.length) * 100);

  return (
    <section className="capture-page capture-form-page" aria-label="Nova ficha de captação">
      <div className="container capture-form-container">
        <header className="capture-form-topbar">
          <button type="button" onClick={onBack} aria-label="Voltar para Captação">
            <Icon className="capture-back-icon" name="arrow" size={20} />
          </button>
          <div className="capture-topbar-title-block">
            <h1>Ficha de Captação</h1>
            <small>Preencha os dados cadastrais do imóvel</small>
          </div>
          <button
            type="button"
            className="capture-topbar-import-btn"
            onClick={() => setIsImportModalOpen(true)}
            title="Importar dados de WhatsApp, Drive ou Google Forms"
          >
            <Icon name="spark" size={16} /> Importar dados
          </button>
          <img
            className="capture-topbar-leaf"
            src="/captacao/capture-hero-plant.jpg"
            alt=""
            aria-hidden="true"
          />
        </header>

        {/* Barra de Progresso do Corretor */}
        <div className="capture-progress-card">
          <div className="capture-progress-info">
            <span>
              <strong>Progresso da Captação:</strong> {filledCount} de {fieldsToCheck.length} campos principais
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="capture-progress-bar-bg">
            <div
              className="capture-progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <ol className="capture-steps" aria-label="Etapas da ficha">
          <li className="is-active">
            <span>1</span>
            <small>Identificação</small>
          </li>
          <li className="is-active">
            <span>2</span>
            <small>Características</small>
          </li>
          <li className="is-active">
            <span>3</span>
            <small>Diferenciais</small>
          </li>
          <li>
            <span>4</span>
            <small>Revisão</small>
          </li>
        </ol>

        <form className="capture-form" onSubmit={continueForm}>
          {/* Seção 1: Dados Principais */}
          <section className="capture-form-section" aria-labelledby="capture-main-data">
            <div className="capture-form-section-heading">
              <Icon name="pin" size={20} />
              <h2 id="capture-main-data">Dados principais e localização</h2>
            </div>

            <div className="capture-fields-grid">
              {/* Card de Busca e Validação Automática de CEP */}
              <div className="cep-auto-lookup-card">
                <div className="cep-lookup-header">
                  <div className="cep-lookup-title">
                    <Icon name="map" size={18} />
                    <span>Validação Automática de Endereço & CEP</span>
                  </div>
                  <span className="cep-auto-tag">Preenchimento Instantâneo</span>
                </div>
                <div className="cep-input-action-row">
                  <input
                    name="cep"
                    value={form.cep}
                    onChange={handleCepChange}
                    placeholder="68550-000"
                    maxLength={9}
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />
                  <button
                    type="button"
                    className="cep-search-trigger-btn"
                    disabled={cepStatus.loading || cleanCepDigits(form.cep).length !== 8}
                    onClick={() => lookupCep(form.cep)}
                  >
                    <Icon name={cepStatus.loading ? "refresh" : "search"} size={14} />
                    <span>{cepStatus.loading ? "Consultando..." : "Validar CEP"}</span>
                  </button>
                </div>

                {cepStatus.loading && (
                  <div className="cep-status-banner cep-status-loading">
                    <Icon name="refresh" size={14} />
                    <span>Consultando bases de dados de CEP e geolocalizando imóvel em Redenção - PA...</span>
                  </div>
                )}

                {cepStatus.success && (
                  <div className="cep-status-banner cep-status-success">
                    <Icon name="check" size={14} />
                    <span>
                      Endereço validado: <strong>{form.neighborhood || form.city}</strong> ({form.zone || "Redenção - PA"})
                    </span>
                    {form.latitude && form.longitude && (
                      <span className="cep-coords-badge" title="Coordenadas geográficas mapeadas">
                        📍 {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}
                      </span>
                    )}
                  </div>
                )}

                {cepStatus.error && (
                  <div className="cep-status-banner cep-status-error">
                    <Icon name="close" size={14} />
                    <span>{cepStatus.error}</span>
                  </div>
                )}
              </div>

              <label>
                <span>
                  Tipo do imóvel<b aria-hidden="true"> *</b>
                </span>
                <select
                  name="propertyType"
                  value={form.propertyType}
                  onChange={updateField}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  {PROPERTY_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  Finalidade<b aria-hidden="true"> *</b>
                </span>
                <select name="purpose" value={form.purpose} onChange={updateField} required>
                  <option value="">Selecione a finalidade</option>
                  {PURPOSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="capture-field-wide">
                <span>Proprietário / Cliente</span>
                <input
                  name="owner"
                  value={form.owner}
                  onChange={updateField}
                  placeholder="Nome completo do proprietário"
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Telefone / WhatsApp</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  placeholder="(94) 99999-9999"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>
              <label>
                <span>Bairro</span>
                <input
                  name="neighborhood"
                  value={form.neighborhood}
                  onChange={updateField}
                  placeholder="Ex.: Park dos Buritis I, Centro"
                  autoComplete="address-level3"
                />
              </label>
              <label>
                <span>Zona / Região</span>
                <input
                  name="zone"
                  value={form.zone}
                  onChange={updateField}
                  placeholder="Ex.: Zona Nobre / Buritis, Zona Sul"
                />
              </label>
              <label>
                <span>Condomínio ou Edifício</span>
                <input
                  name="condominium"
                  value={form.condominium}
                  onChange={updateField}
                  placeholder="Ex.: Residencial Buritis, Ed. Sol Nascente"
                  autoComplete="off"
                />
              </label>
              <label className="capture-field-wide">
                <span>Endereço / Logradouro</span>
                <input
                  name="address"
                  value={form.address}
                  onChange={updateField}
                  placeholder="Rua, Avenida, Quadra, Lote ou Número"
                  autoComplete="street-address"
                />
              </label>
            </div>
          </section>

          {/* Seção 2: Características */}
          <section className="capture-form-section" aria-labelledby="capture-features">
            <div className="capture-form-section-heading">
              <Icon name="area" size={20} />
              <h2 id="capture-features">Características e metragens</h2>
            </div>

            <div className="capture-number-grid">
              <label>
                <span>Quartos</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={updateField}
                  placeholder="0"
                />
              </label>
              <label>
                <span>Suítes</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  name="suites"
                  value={form.suites}
                  onChange={updateField}
                  placeholder="0"
                />
              </label>
              <label>
                <span>Banheiros</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={updateField}
                  placeholder="0"
                />
              </label>
              <label>
                <span>Vagas de garagem</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  name="parkingSpaces"
                  value={form.parkingSpaces}
                  onChange={updateField}
                  placeholder="0"
                />
              </label>
              <label>
                <span>Área construída (m²)</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  name="builtArea"
                  value={form.builtArea}
                  onChange={updateField}
                  placeholder="0.00"
                />
              </label>
              <label>
                <span>Área do terreno (m²)</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  name="landArea"
                  value={form.landArea}
                  onChange={updateField}
                  placeholder="0.00"
                />
              </label>
            </div>
          </section>

          {/* Seção 3: Diferenciais */}
          <section
            className="capture-form-section capture-differentials"
            aria-labelledby="capture-differentials"
          >
            <div className="capture-form-section-heading">
              <Icon name="spark" size={20} />
              <h2 id="capture-differentials">Diferenciais e comodidades</h2>
            </div>
            <div className="capture-chip-grid">
              {DIFFERENTIALS.map((item) => (
                <fieldset key={item}>
                  <legend>{item}</legend>
                  <div>
                    <button
                      className={differentials[item] === true ? "is-selected" : ""}
                      type="button"
                      aria-pressed={differentials[item] === true}
                      onClick={() =>
                        setDifferentials((current) => ({ ...current, [item]: true }))
                      }
                    >
                      Sim
                    </button>
                    <button
                      className={differentials[item] === false ? "is-selected" : ""}
                      type="button"
                      aria-pressed={differentials[item] === false}
                      onClick={() =>
                        setDifferentials((current) => ({ ...current, [item]: false }))
                      }
                    >
                      Não
                    </button>
                  </div>
                </fieldset>
              ))}
            </div>
          </section>

          {/* Seção 4: Observações */}
          <section
            className="capture-form-section capture-notes-section"
            aria-labelledby="capture-notes"
          >
            <label className="capture-notes-field">
              <span id="capture-notes">Observações e detalhes de negociação</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={updateField}
                placeholder="Adicione informações relevantes sobre o imóvel, mobília, condições de pagamento, permutas..."
                rows="5"
                maxLength="500"
              />
              <small>{form.notes.length}/500 caracteres</small>
            </label>
          </section>

          {notice ? (
            <p className="capture-form-notice" role="status">
              {notice}
            </p>
          ) : null}

          <div className="capture-form-actions">
            <button className="capture-save-button" type="button" onClick={saveDraft}>
              <Icon name="copy" size={18} /> Salvar rascunho
            </button>
            <button className="capture-continue-button" type="submit">
              Revisar Ficha <Icon name="arrow" size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Importação dentro do formulário */}
      <CaptacaoImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportData={handleImportedData}
      />
    </section>
  );
}

export function CaptacaoSummary({ draft, onBack, onEdit, onFinishSuccess }) {
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const form = { ...INITIAL_FORM, ...(draft?.form || {}) };
  const differentials = draft?.differentials || {};
  const selectedDifferentials = DIFFERENTIALS.filter(
    (item) => differentials[item] === true
  );
  const location = [form.condominium, form.neighborhood].filter(Boolean).join(" • ");
  const features = [
    form.bedrooms
      ? { icon: "bed", label: `${form.bedrooms} quarto${String(form.bedrooms) === "1" ? "" : "s"}` }
      : null,
    form.suites
      ? { icon: "bed", label: `${form.suites} suíte${String(form.suites) === "1" ? "" : "s"}` }
      : null,
    form.bathrooms
      ? {
          icon: "bath",
          label: `${form.bathrooms} banheiro${String(form.bathrooms) === "1" ? "" : "s"}`,
        }
      : null,
    form.parkingSpaces
      ? {
          icon: "car",
          label: `${form.parkingSpaces} vaga${String(form.parkingSpaces) === "1" ? "" : "s"}`,
        }
      : null,
  ].filter(Boolean);

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  async function handleDownloadPdf() {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    showNotice("Gerando PDF com logotipo oficial da Alyne...");
    try {
      await downloadCaptacaoPdf(form, selectedDifferentials, (msg) => showNotice(msg));
      showNotice("PDF da ficha de captação baixado com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      showNotice("Tentando abrir visualização de impressão...");
      generatePrintWindow();
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function generatePrintWindow() {
    const safe = (value) =>
      String(value || "Não informado")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const popup = window.open("", "_blank", "width=900,height=1100");

    if (!popup) {
      showNotice("O navegador bloqueou a janela do PDF. Permita pop-ups e tente novamente.");
      return;
    }

    const differentialsText = selectedDifferentials.length
      ? selectedDifferentials.map(safe).join(", ")
      : "Nenhum informado";

    popup.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Ficha de Captação - Alyne Crisóstomo</title>
          <style>
            @page { size: A4; margin: 16mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: 'Helvetica Neue', Arial, sans-serif;
              color: #1e2922;
              background: #ffffff;
            }
            .header-banner {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #c8a45f;
              padding-bottom: 14px;
              margin-bottom: 22px;
              background: #0e2a22;
              color: #ffffff;
              padding: 16px 20px;
              border-radius: 8px;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .pdf-logo {
              width: 58px;
              height: 58px;
              object-fit: cover;
              border-radius: 6px;
              border: 2px solid #c8a45f;
              background: #ffffff;
            }
            .brand {
              font-family: Georgia, serif;
              font-size: 22px;
              color: #ffffff;
              margin: 0 0 4px;
              letter-spacing: 0.5px;
            }
            .subtitle {
              margin: 0;
              font-size: 10px;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              color: #c8a45f;
              font-weight: bold;
            }
            .header-badge {
              background: #ffffff;
              color: #0e2a22;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
              text-align: right;
              border: 1px solid #c8a45f;
            }
            h2 {
              margin: 20px 0 8px;
              font-family: Georgia, serif;
              font-size: 15px;
              color: #174b3e;
              border-bottom: 1px solid #e4ded4;
              padding-bottom: 4px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 18px;
            }
            .item {
              padding: 6px 0;
              border-bottom: 1px solid #f0ece5;
            }
            .label {
              display: block;
              font-size: 9.5px;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #6b756f;
              margin-bottom: 2px;
              font-weight: bold;
            }
            .value {
              font-size: 13px;
              line-height: 1.4;
              color: #0e2a22;
              font-weight: 500;
            }
            .full { grid-column: 1 / -1; }
            .notes {
              white-space: pre-wrap;
              line-height: 1.5;
              background: #fdfbf7;
              padding: 10px;
              border-radius: 6px;
              border: 1px solid #e8e3d9;
            }
            .footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #d8d1c5;
              font-size: 10px;
              color: #6b756f;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <header class="header-banner">
            <div class="header-left">
              <img src="${window.location.origin}/branding/logo-alyne-padrao.jpg" alt="Logo Alyne Crisóstomo" class="pdf-logo" />
              <div>
                <h1 class="brand">Alyne Crisóstomo Imóveis</h1>
                <p class="subtitle">Dossiê de Captação Imobiliária • Redenção - PA</p>
              </div>
            </div>
            <div class="header-badge">
              <div>FICHA DE CAPTAÇÃO</div>
              <small style="color: #6b756f;">${safe(form.purpose)} • ${safe(form.propertyType)}</small>
            </div>
          </header>

          <h2>1. Dados Principais & Proprietário</h2>
          <div class="grid">
            <div class="item"><span class="label">Tipo do Imóvel</span><span class="value">${safe(form.propertyType)}</span></div>
            <div class="item"><span class="label">Finalidade</span><span class="value">${safe(form.purpose)}</span></div>
            <div class="item"><span class="label">Proprietário</span><span class="value">${safe(form.owner)}</span></div>
            <div class="item"><span class="label">Telefone / Contato</span><span class="value">${safe(form.phone)}</span></div>
          </div>

          <h2>2. Localização</h2>
          <div class="grid">
            <div class="item"><span class="label">Bairro</span><span class="value">${safe(form.neighborhood)}</span></div>
            <div class="item"><span class="label">Condomínio / Edifício</span><span class="value">${safe(form.condominium)}</span></div>
            <div class="item full"><span class="label">Endereço / Quadra & Lote</span><span class="value">${safe(form.address)}</span></div>
          </div>

          <h2>3. Estrutura & Metragens</h2>
          <div class="grid">
            <div class="item"><span class="label">Quartos</span><span class="value">${safe(form.bedrooms)}</span></div>
            <div class="item"><span class="label">Suítes</span><span class="value">${safe(form.suites)}</span></div>
            <div class="item"><span class="label">Banheiros</span><span class="value">${safe(form.bathrooms)}</span></div>
            <div class="item"><span class="label">Vagas de Garagem</span><span class="value">${safe(form.parkingSpaces)}</span></div>
            <div class="item"><span class="label">Área Construída</span><span class="value">${form.builtArea ? `${safe(form.builtArea)} m²` : "Não informada"}</span></div>
            <div class="item"><span class="label">Área do Terreno</span><span class="value">${form.landArea ? `${safe(form.landArea)} m²` : "Não informada"}</span></div>
          </div>

          <h2>4. Diferenciais & Itens Extras</h2>
          <div class="item">
            <span class="value">${differentialsText}</span>
          </div>

          <h2>5. Observações & Negociação</h2>
          <div class="item">
            <div class="value notes">${safe(form.notes)}</div>
          </div>

          <div class="footer">
            <span>Documento oficial gerado pelo sistema administrativo Alyne Crisóstomo.</span>
            <span>Data: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>

          <script>
            window.onload = () => {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    popup.document.close();
  }

  async function finalizeReview() {
    if (saving) return;

    setSaving(true);
    setNotice("");

    try {
      const response = await fetch("/api/admin/captacao", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(draft || {}),
          status: "completed",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sua sessão expirou. Entre novamente no Admin.");
        }
        if (result?.code === "DATABASE_UNAVAILABLE") {
          throw new Error("Não foi possível salvar a ficha no banco de dados.");
        }
        throw new Error("Não foi possível finalizar a ficha.");
      }

      setNotice("Ficha concluída e salva no banco de dados com sucesso!");
      setTimeout(() => {
        onFinishSuccess?.();
      }, 1200);
    } catch (error) {
      setNotice(error?.message || "Não foi possível finalizar a ficha.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="capture-page capture-form-page capture-summary-page"
      aria-label="Resumo da ficha de captação"
    >
      <div className="container capture-form-container capture-summary-container">
        <header className="capture-form-topbar">
          <button type="button" onClick={onBack} aria-label="Voltar para Captação">
            <Icon className="capture-back-icon" name="arrow" size={20} />
          </button>
          <div className="capture-topbar-title-block">
            <h1>Resumo da Ficha</h1>
            <small>Revise os dados antes de finalizar o cadastro</small>
          </div>
          <img
            className="capture-topbar-leaf"
            src="/captacao/capture-hero-plant.jpg"
            alt=""
            aria-hidden="true"
          />
        </header>

        <div className="capture-summary-banner" role="status">
          <span>
            <Icon name="check" size={18} />
          </span>
          <div>
            <strong>Ficha de Captação Estruturada</strong>
            <small>Todos os dados foram consolidados e estão prontos para arquivamento ou exportação.</small>
          </div>
          <img src="/captacao/capture-hero-plant.jpg" alt="" aria-hidden="true" />
        </div>

        <article className="capture-summary-groups">
          <section className="capture-summary-section" aria-labelledby="summary-main-data">
            <header className="capture-summary-heading">
              <Icon name="pin" size={18} />
              <h2 id="summary-main-data">Dados principais e localização</h2>
              <button type="button" onClick={onEdit}>
                Editar <Icon name="arrow" size={14} />
              </button>
            </header>
            <div className="capture-summary-data">
              <p>
                <strong>{form.propertyType || "Tipo não informado"}</strong>
                <span>•</span>
                {form.purpose || "Finalidade não informada"}
              </p>
              <p>Proprietário: {form.owner || "Não informado"}</p>
              {form.phone ? <p>Telefone: {form.phone}</p> : null}
              {form.cep ? <p>CEP: {form.cep} {form.zone ? `(${form.zone})` : ""}</p> : null}
              <p>{location || "Bairro ou condomínio não informado"}</p>
              {form.address ? <p>{form.address}</p> : null}
              {form.latitude && form.longitude ? (
                <p style={{ fontSize: "11.5px", color: "#5c6861" }}>
                  📍 Coordenadas: {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}
                </p>
              ) : null}
            </div>
          </section>

          <section className="capture-summary-section" aria-labelledby="summary-features">
            <header className="capture-summary-heading">
              <Icon name="area" size={18} />
              <h2 id="summary-features">Características e metragens</h2>
              <button type="button" onClick={onEdit}>
                Editar <Icon name="arrow" size={14} />
              </button>
            </header>
            {features.length ? (
              <div className="capture-summary-features">
                {features.map((item) => (
                  <span key={item.label}>
                    <Icon name={item.icon} size={15} />
                    {item.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="capture-summary-empty">Nenhuma quantidade informada.</p>
            )}
            <div className="capture-summary-data is-compact">
              <p>Área construída: {form.builtArea ? `${form.builtArea} m²` : "Não informada"}</p>
              <p>Área do terreno: {form.landArea ? `${form.landArea} m²` : "Não informada"}</p>
            </div>
          </section>

          <section className="capture-summary-section" aria-labelledby="summary-comforts">
            <header className="capture-summary-heading">
              <Icon name="spark" size={18} />
              <h2 id="summary-comforts">Comodidades e diferenciais</h2>
              <button type="button" onClick={onEdit}>
                Editar <Icon name="arrow" size={14} />
              </button>
            </header>
            {selectedDifferentials.length ? (
              <div className="capture-summary-comforts">
                {selectedDifferentials.map((item) => (
                  <span key={item}>
                    <i>
                      <Icon name="check" size={11} />
                    </i>
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="capture-summary-empty">Nenhum diferencial selecionado.</p>
            )}
          </section>

          <section className="capture-summary-section" aria-labelledby="summary-notes">
            <header className="capture-summary-heading">
              <Icon name="copy" size={18} />
              <h2 id="summary-notes">Observações e negociação</h2>
              <button type="button" onClick={onEdit}>
                Editar <Icon name="arrow" size={14} />
              </button>
            </header>
            <p className="capture-summary-notes">
              {form.notes || "Nenhuma observação adicionada."}
            </p>
          </section>
        </article>

        <div className="capture-summary-actions">
          <button type="button" onClick={onEdit}>
            <Icon name="copy" size={17} /> Editar campos
          </button>
          <button type="button" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
            <Icon name="pdf" size={17} /> {isGeneratingPdf ? "Gerando PDF..." : "Baixar PDF Oficial"}
          </button>
          <button type="button" onClick={generatePrintWindow} title="Abrir versão de impressão">
            <Icon name="spark" size={16} /> Imprimir Ficha
          </button>
        </div>

        <button
          className="capture-summary-primary"
          type="button"
          onClick={finalizeReview}
          disabled={saving}
        >
          {saving ? "Salvando ficha no sistema..." : "Finalizar e Salvar Ficha"}{" "}
          {!saving && <Icon name="arrow" size={18} />}
        </button>

        {notice ? (
          <p className="capture-summary-notice" role="status">
            {notice}
          </p>
        ) : null}
      </div>
    </section>
  );
}
