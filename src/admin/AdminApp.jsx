"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { properties as initialProperties, purposeLabels, typeLabels } from "../properties";
import { propertyGallery, propertyPublicLocation, propertyStatus } from "../propertyStatus";
import { CaptacaoDashboard, CaptacaoForm, CaptacaoSummary } from "../components/Captacao";
import { Icon } from "../components/Icons";
import { normalizePropertyCode, propertyCodeFromRecord, suggestAvailablePropertyCodes } from "./propertyCodes";

const FILTERS = [
  ["all", "Todos os status"],
  ["active", "Disponíveis no site"],
  ["unavailable", "Indisponíveis"],
  ["archived", "Arquivados"],
];
const ADVANCED_FEATURES = [
  "Piscina",
  "Dois pisos",
  "Área gourmet",
  "Energia solar",
  "Móveis planejados",
  "Condomínio fechado",
  "Quintal",
  "Varanda",
  "Escritório",
  "Closet",
  "Churrasqueira",
  "Portão eletrônico",
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function formatPrice(property) {
  const price = Number(property.price);
  if (!Number.isFinite(price) || price <= 0) return "Valor sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(price);
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function freshProperty(records) {
  const idRef = suggestAvailablePropertyCodes(records, 1)[0];
  return {
    id: `REF-${idRef}`,
    idRef,
    slug: "",
    title: "",
    purpose: "venda",
    type: "casa",
    city: "Redenção",
    neighborhood: "",
    publicLocation: "Redenção, PA",
    price: "",
    priceOnRequest: false,
    priceNote: "",
    condominiumFee: "",
    bedrooms: "",
    suites: "",
    bathrooms: "",
    parking: "",
    builtArea: "",
    landArea: "",
    status: "Disponível",
    featured: false,
    shortDescription: "",
    fullDescription: "",
    features: [],
    amenities: [],
    documents: [],
    financeable: null,
    furnished: null,
    publishedAt: new Date().toISOString().slice(0, 10),
    gallery: [],
    mainImage: null,
  };
}

function EditableField({ label, name, value, onChange, type = "text", required = false, children }) {
  return (
    <label className="admin-field">
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      {children || (
        <input
          name={name}
          type={type}
          value={value ?? ""}
          required={required}
          onChange={(event) => onChange(name, event.target.value)}
        />
      )}
    </label>
  );
}

function PropertyEditor({ property, isNew, records, onClose, onSave, onUpload }) {
  const [draft, setDraft] = useState(property);
  const [codeError, setCodeError] = useState("");
  const [saveError, setSaveError] = useState("");
  const firstField = useRef(null);
  const codeSuggestions = useMemo(() => suggestAvailablePropertyCodes(records, 4), [records]);
  const usedCodes = useMemo(() => new Set(records
    .filter((item) => item.id !== property.id)
    .map(propertyCodeFromRecord)
    .filter(Boolean)), [records, property.id]);

  useEffect(() => {
    firstField.current?.focus();
    const close = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  function update(name, value) {
    if (name === "idRef") {
      const code = normalizePropertyCode(value);
      setCodeError(code && usedCodes.has(code) ? `O código ${code} já pertence a outro imóvel.` : "");
    }
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function toggleFeature(label) {
    setDraft((current) => {
      const features = Array.isArray(current.features) ? current.features : [];
      return {
        ...current,
        features: features.includes(label) ? features.filter((item) => item !== label) : [...features, label],
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    const idRef = normalizePropertyCode(draft.idRef);
    if (!idRef) {
      setCodeError("Informe um código numérico para o imóvel.");
      return;
    }
    if (usedCodes.has(idRef)) {
      setCodeError(`O código ${idRef} já pertence a outro imóvel. Escolha uma das sugestões disponíveis.`);
      return;
    }
    const gallery = Array.isArray(draft.gallery) ? draft.gallery : [];
    setSaveError("");
    try {
      await onSave({
        ...draft,
        idRef,
        id: isNew ? `REF-${idRef}` : draft.id,
        slug: draft.slug || `${slugify(draft.title)}-ref-${idRef}`,
        price: draft.price === "" ? null : Number(draft.price),
        bedrooms: draft.bedrooms === "" ? null : Number(draft.bedrooms),
        suites: draft.suites === "" ? null : Number(draft.suites),
        bathrooms: draft.bathrooms === "" ? null : Number(draft.bathrooms),
        parking: draft.parking === "" ? null : Number(draft.parking),
        builtArea: draft.builtArea === "" ? null : Number(draft.builtArea),
        landArea: draft.landArea === "" ? null : Number(draft.landArea),
        mainImage: gallery[0] || draft.mainImage || null,
        gallery,
      });
    } catch (error) {
      if (error.message === "PROPERTY_CODE_EXISTS") {
        setCodeError(`O código ${idRef} acabou de ser usado. Escolha outro código disponível.`);
      } else {
        setSaveError("Não foi possível salvar agora. Tente novamente.");
      }
    }
  }

  function useAsCover(index) {
    setDraft((current) => {
      const gallery = [...(current.gallery || [])];
      const [cover] = gallery.splice(index, 1);
      if (!cover) return current;
      gallery.unshift(cover);
      return { ...current, gallery, mainImage: cover };
    });
  }

  async function addPhotos(event, makeFirstPhotoCover = false) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (files.some((file) => file.size > 12 * 1024 * 1024)) {
      window.alert("Cada imagem pode ter no máximo 12 MB.");
      event.target.value = "";
      return;
    }
    try {
      const uploadedImages = [];
      for (const file of files) {
        const uploaded = await onUpload(file, draft.id);
        uploadedImages.push({
          src: uploaded.src,
          alt: draft.title || "Foto do imóvel",
          label: file.name || "Foto do imóvel",
          fit: "cover",
          position: "center",
          logoVerified: true,
        });
      }
      setDraft((current) => ({
        ...current,
        gallery: makeFirstPhotoCover
          ? [...uploadedImages, ...(current.gallery || [])]
          : [...(current.gallery || []), ...uploadedImages],
        mainImage: makeFirstPhotoCover
          ? uploadedImages[0]
          : current.mainImage || uploadedImages[0],
      }));
    } catch {
      window.alert("Não foi possível enviar todas as fotos. Tente novamente.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="admin-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <header>
          <div>
            <span className="admin-kicker">{isNew ? "Novo cadastro" : draft.id}</span>
            <h2 id="editor-title">{isNew ? "Adicionar imóvel" : "Editar imóvel"}</h2>
          </div>
          <button className="admin-icon-button" type="button" onClick={onClose} aria-label="Fechar edição">
            <Icon name="close" size={23} />
          </button>
        </header>

        <form onSubmit={submit}>
          <div className="admin-editor-grid">
            <EditableField label="Título do imóvel" name="title" value={draft.title} onChange={update} required>
              <input ref={firstField} name="title" value={draft.title} required onChange={(event) => update("title", event.target.value)} />
            </EditableField>
            <label className="admin-field admin-code-field">
              <span>Código do imóvel<b aria-hidden="true"> *</b></span>
              <input
                name="idRef"
                inputMode="numeric"
                value={draft.idRef}
                required
                aria-invalid={Boolean(codeError)}
                aria-describedby="property-code-help"
                onChange={(event) => update("idRef", event.target.value)}
              />
              {isNew && (
                <div className="admin-code-suggestions" id="property-code-help">
                  <small>Códigos disponíveis:</small>
                  {codeSuggestions.map((code) => (
                    <button type="button" key={code} onClick={() => update("idRef", code)}>{code}</button>
                  ))}
                </div>
              )}
              {codeError && <small className="admin-field-error" role="alert">{codeError}</small>}
            </label>
            <EditableField label="Finalidade" name="purpose" value={draft.purpose} onChange={update}>
              <select value={draft.purpose} onChange={(event) => update("purpose", event.target.value)}>
                {Object.entries(purposeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </EditableField>
            <EditableField label="Tipo" name="type" value={draft.type} onChange={update}>
              <select value={draft.type} onChange={(event) => update("type", event.target.value)}>
                {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </EditableField>
            <EditableField label="Preço (R$)" name="price" type="number" value={draft.price} onChange={update} />
            <EditableField label="Status" name="status" value={draft.status} onChange={update}>
              <select value={draft.status} onChange={(event) => update("status", event.target.value)}>
                <option>Disponível</option>
                <option>Disponibilidade sob consulta</option>
                <option>Indisponível</option>
                <option>Arquivado</option>
              </select>
            </EditableField>
            <EditableField label="Bairro" name="neighborhood" value={draft.neighborhood} onChange={update} />
            <EditableField label="Localização exibida" name="publicLocation" value={draft.publicLocation} onChange={update} />
            <EditableField label="Quartos" name="bedrooms" type="number" value={draft.bedrooms} onChange={update} />
            <EditableField label="Suítes" name="suites" type="number" value={draft.suites} onChange={update} />
            <EditableField label="Vagas" name="parking" type="number" value={draft.parking} onChange={update} />
            <EditableField label="Área construída (m²)" name="builtArea" type="number" value={draft.builtArea} onChange={update} />
          </div>

          <label className="admin-field admin-field-wide">
            <span>Descrição curta</span>
            <input value={draft.shortDescription || ""} onChange={(event) => update("shortDescription", event.target.value)} />
          </label>
          <label className="admin-field admin-field-wide">
            <span>Descrição completa</span>
            <textarea rows="4" value={draft.fullDescription || ""} onChange={(event) => update("fullDescription", event.target.value)} />
          </label>

          <details className="admin-advanced-section">
            <summary>Filtros e características avançadas <small>Opcional</small></summary>
            <p>Marque somente o que este imóvel realmente possui. Você pode editar estas opções depois.</p>
            <div className="admin-feature-options">
              {ADVANCED_FEATURES.map((label) => (
                <label key={label}>
                  <input type="checkbox" checked={(draft.features || []).includes(label)} onChange={() => toggleFeature(label)} />
                  <span>{label}</span>
                </label>
              ))}
              <label>
                <input type="checkbox" checked={draft.furnished === true} onChange={(event) => update("furnished", event.target.checked)} />
                <span>Mobiliado</span>
              </label>
              <label>
                <input type="checkbox" checked={draft.financeable === true} onChange={(event) => update("financeable", event.target.checked)} />
                <span>Financiável</span>
              </label>
            </div>
            <label className="admin-field admin-field-wide">
              <span>Outra característica</span>
              <input placeholder="Ex.: poço artesiano, edícula, frente para avenida" onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                const label = event.currentTarget.value.trim();
                if (label && !(draft.features || []).includes(label)) update("features", [...(draft.features || []), label]);
                event.currentTarget.value = "";
              }} />
              <small>Digite e pressione Enter para adicionar.</small>
            </label>
            {(draft.features || []).filter((label) => !ADVANCED_FEATURES.includes(label)).length > 0 && (
              <div className="admin-custom-features">
                {(draft.features || []).filter((label) => !ADVANCED_FEATURES.includes(label)).map((label) => (
                  <button type="button" key={label} onClick={() => toggleFeature(label)}>{label} <span>×</span></button>
                ))}
              </div>
            )}
          </details>

          <div className="admin-photo-section">
            <div className="admin-photo-heading">
              <div>
                <strong>Capa e fotos do imóvel</strong>
                <small>Toque em uma foto salva para usá-la como capa ou envie novas imagens.</small>
              </div>
              <div className="admin-photo-buttons">
                <label className="admin-photo-picker admin-photo-picker-cover">
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => addPhotos(event, true)} />
                  <span>Escolher nova capa</span>
                </label>
                <label className="admin-photo-picker">
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => addPhotos(event, false)} />
                  <span>Adicionar fotos</span>
                </label>
              </div>
              <small className="admin-photo-source-help">Escolha da biblioteca do celular, dos arquivos do computador ou do Google Drive.</small>
            </div>
            <div className="admin-photo-strip">
              {(draft.gallery || []).map((image, index) => (
                <div className={`admin-photo-thumb ${index === 0 ? "is-cover" : ""}`} key={`${image.src}-${index}`}>
                  <img src={image.src} alt={image.alt || `Foto ${index + 1}`} />
                  {index === 0 && <span>Capa</span>}
                  <div className="admin-photo-actions">
                    {index !== 0 && <button type="button" onClick={() => useAsCover(index)}>Usar como capa</button>}
                    <button className="admin-photo-remove" type="button" aria-label={`Remover foto ${index + 1}`} onClick={() => setDraft((current) => {
                      const gallery = current.gallery.filter((_, itemIndex) => itemIndex !== index);
                      return { ...current, gallery, mainImage: gallery[0] || null };
                    })}>Remover</button>
                  </div>
                </div>
              ))}
              {(draft.gallery || []).length === 0 && <div className="admin-photo-empty">Nenhuma foto adicionada.</div>}
            </div>
          </div>

          <footer>
            {saveError && <p className="admin-save-error" role="alert">{saveError}</p>}
            <button className="admin-button admin-button-secondary" type="button" onClick={onClose}>Cancelar</button>
            <button className="admin-button admin-button-primary" type="submit">Salvar imóvel</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function ConfirmDialog({ title, message, actionLabel, danger = false, onCancel, onConfirm }) {
  return (
    <div className="admin-modal-backdrop admin-confirm-backdrop" role="presentation">
      <section className="admin-confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div>
          <button className="admin-button admin-button-secondary" type="button" onClick={onCancel}>Cancelar</button>
          <button className={`admin-button ${danger ? "admin-button-danger" : "admin-button-primary"}`} type="button" onClick={onConfirm}>{actionLabel}</button>
        </div>
      </section>
    </div>
  );
}

function LoginScreen({ onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error(response.status === 429 ? "Muitas tentativas. Aguarde um minuto." : "Senha incorreta.");
      onAuthenticated();
    } catch (cause) {
      setError(cause.message || "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-shell">
      <form className="admin-login-card" onSubmit={submit}>
        <img src="/branding/logo-alyne-padrao.jpg" alt="Alyne Crisóstomo Imóveis" />
        <span className="admin-kicker">Acesso restrito</span>
        <h1>Área da administradora</h1>
        <p>Entre com sua senha para gerenciar os imóveis.</p>
        <label className="admin-field"><span>E-mail</span><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus /></label>
        <label className="admin-field"><span>Senha</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p className="admin-login-error" role="alert">{error}</p>}
        <button className="admin-button admin-button-gold" type="submit" disabled={busy}>{busy ? "Entrando..." : "Entrar"}</button>
        <a href="/">Voltar ao site</a>
      </form>
    </main>
  );
}

export default function AdminApp() {
  const [records, setRecords] = useState(initialProperties);
  const [auth, setAuth] = useState("loading");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState("");
  const [activeSection, setActiveSection] = useState("properties");
  const [captureView, setCaptureView] = useState("dashboard");
  const [captureDraft, setCaptureDraft] = useState(null);

  useEffect(() => {
    fetch("/api/admin/session").then((response) => response.json()).then((payload) => setAuth(payload.authenticated ? "authenticated" : "anonymous")).catch(() => setAuth("anonymous"));
  }, []);

  useEffect(() => {
    if (auth !== "authenticated") return;
    fetch("/api/admin/properties").then((response) => response.ok ? response.json() : Promise.reject()).then((payload) => Array.isArray(payload.properties) && setRecords(payload.properties)).catch(() => setToast("Não foi possível carregar os dados permanentes."));
  }, [auth]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const closeMenus = () => setOpenMenu(null);
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  useEffect(() => {
    if (activeSection !== "capture") return;
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, [activeSection, captureView]);

  const visible = useMemo(() => {
    const term = normalizeText(query);
    return records.filter((property) => {
      const status = propertyStatus(property).key;
      if (filter === "active" && !["available", "consultation"].includes(status)) return false;
      if (filter === "unavailable" && status !== "unavailable") return false;
      if (filter === "archived" && status !== "archived") return false;
      if (!term) return true;
      return normalizeText([property.id, property.title, propertyPublicLocation(property)].join(" ")).includes(term);
    });
  }, [records, query, filter]);

  async function persistRecord(next, createOnly = false) {
    const response = await fetch("/api/admin/properties", { method: "PUT", headers: { "Content-Type": "application/json", "X-Admin-Operation": createOnly ? "create" : "update" }, body: JSON.stringify(next) });
    if (response.status === 401) setAuth("anonymous");
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      if (payload.code === "PROPERTY_CODE_EXISTS") {
        const refreshed = await fetch("/api/admin/properties").then((result) => result.ok ? result.json() : null).catch(() => null);
        if (Array.isArray(refreshed?.properties)) setRecords(refreshed.properties);
      }
      throw new Error(payload.code || "SAVE_FAILED");
    }
    return (await response.json()).property;
  }

  async function updateRecord(next) {
    const saved = await persistRecord(next, isNew);
    setRecords((current) => {
      const exists = current.some((item) => item.id === saved.id);
      return exists ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current];
    });
    setEditing(null);
    setIsNew(false);
    setToast(isNew ? "Imóvel adicionado." : "Alterações salvas.");
  }

  async function setStatus(id, status) {
    const current = records.find((item) => item.id === id);
    if (!current) return;
    const saved = await persistRecord({ ...current, status });
    setRecords((items) => items.map((item) => item.id === id ? saved : item));
    setToast(status === "Indisponível" ? "Imóvel marcado como indisponível." : "Imóvel publicado no site.");
  }

  function requestAvailabilityChange(property, makeAvailable) {
    const nextStatus = makeAvailable ? "Disponível" : "Indisponível";
    setConfirm({
      title: makeAvailable ? "Deixar este imóvel disponível?" : "Deixar este imóvel indisponível?",
      message: makeAvailable
        ? `${property.id} voltará a aparecer como disponível no site.`
        : `${property.id} continuará aparecendo no site, identificado como ${property.purpose === "locacao" ? "alugado" : "vendido"}.`,
      actionLabel: "Confirmar ação",
      onConfirm: async () => {
        await setStatus(property.id, nextStatus);
        setConfirm(null);
      },
    });
  }

  function requestArchive(property) {
    setConfirm({
      title: "Arquivar este imóvel?",
      message: `${property.id} ficará guardado no Admin e deixará de aparecer no catálogo público.`,
      actionLabel: "Arquivar imóvel",
      onConfirm: async () => {
        await setStatus(property.id, "Arquivado");
        setConfirm(null);
        setToast("Imóvel arquivado.");
      },
    });
  }

  function requestDelete(property) {
    setConfirm({
      title: "Excluir permanentemente?",
      message: `${property.id} — ${property.title} será removido desta prévia. Esta ação não pode ser desfeita.`,
      actionLabel: "Excluir imóvel",
      danger: true,
      onConfirm: async () => {
        const response = await fetch(`/api/admin/properties/${encodeURIComponent(property.id)}`, { method: "DELETE" });
        if (!response.ok) throw new Error("DELETE_FAILED");
        setRecords((current) => current.filter((item) => item.id !== property.id));
        setConfirm(null);
        setToast("Imóvel excluído.");
      },
    });
  }

  async function uploadPhoto(file, propertyId) {
    const response = await fetch("/api/admin/photos", { method: "POST", headers: { "Content-Type": file.type, "X-Property-Id": propertyId }, body: file });
    if (!response.ok) throw new Error("UPLOAD_FAILED");
    return response.json();
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuth("anonymous");
  }

  if (auth === "loading") return <main className="admin-loading">Carregando acesso seguro...</main>;
  if (auth === "anonymous") return <LoginScreen onAuthenticated={() => setAuth("authenticated")} />;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/" aria-label="Ir para o site público">
          <img src="/branding/logo-alyne-padrao.jpg" alt="Alyne Crisóstomo Imóveis" />
        </a>
        <nav aria-label="Navegação administrativa">
          <button className={`admin-section-tab ${activeSection === "properties" ? "active" : ""}`} type="button" onClick={() => {
            setActiveSection("properties");
            setEditing(null);
          }}><span>Imóveis</span></button>
          <button className={`admin-section-tab ${activeSection === "capture" ? "active" : ""}`} type="button" onClick={() => {
            setActiveSection("capture");
            setCaptureView("dashboard");
            setEditing(null);
          }}><span>Captação</span></button>
          <a href="/" target="_blank" rel="noreferrer">Ver site</a>
          <button type="button" onClick={logout}>Sair com segurança</button>
        </nav>
        <div className="admin-profile">
          <span className="admin-avatar">AC</span>
          <div><strong>Alyne Crisóstomo</strong><small>Administradora</small></div>
        </div>
      </aside>

      {activeSection === "capture" ? (
        <section className="admin-workspace admin-capture-workspace">
          {captureView === "summary" ? (
            <CaptacaoSummary
              draft={captureDraft}
              onBack={() => setCaptureView("form")}
              onEdit={() => setCaptureView("form")}
            />
          ) : captureView === "form" ? (
            <CaptacaoForm
              initialDraft={captureDraft}
              onBack={() => setCaptureView("dashboard")}
              onContinue={(draft) => {
                setCaptureDraft(draft);
                setCaptureView("summary");
              }}
            />
          ) : (
            <CaptacaoDashboard onNewForm={() => {
              setCaptureDraft(null);
              setCaptureView("form");
            }} />
          )}
        </section>
      ) : (
      <section className="admin-workspace">
        <header className="admin-page-header">
          <div>
            <h1>Imóveis</h1>
            <p>Gerencie os imóveis exibidos no site.</p>
          </div>
          <button className="admin-button admin-button-gold" type="button" onClick={() => {
            setEditing(freshProperty(records));
            setIsNew(true);
          }}>Adicionar imóvel</button>
        </header>

        <div className="admin-toolbar">
          <label className="admin-search">
            <Icon name="search" size={20} />
            <span className="sr-only">Buscar imóveis</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por referência, título ou localização" />
          </label>
          <label className="admin-filter">
            <Icon name="filter" size={19} />
            <span className="sr-only">Filtrar por status</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              {FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>

        <div className="admin-result-note" aria-live="polite">
          {visible.length} {visible.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </div>

        {visible.length > 0 ? (
          <div className="admin-property-grid">
            {visible.map((property) => {
              const cover = propertyGallery(property)[0];
              const status = propertyStatus(property).key;
              const available = ["available", "consultation"].includes(status);
              return (
                <article className={`admin-property-card status-${status}`} key={property.id}>
                  <div className="admin-card-image">
                    {cover?.src ? <img src={cover.src} alt={cover.alt || property.title} /> : <div className="admin-no-photo">Sem foto</div>}
                    {status === "archived" && <span>Arquivado</span>}
                  </div>
                  <div className="admin-card-body">
                    <span className="admin-ref">{property.id}</span>
                    <h2>{property.title}</h2>
                    <strong className="admin-price">{formatPrice(property)}</strong>
                    <p><Icon name="pin" size={16} /> {propertyPublicLocation(property) || "Localização não informada"}</p>
                    <div className="admin-card-actions">
                      <label className="admin-availability">
                        <span>{available ? "Disponível no site" : status === "archived" ? "Arquivado" : "Indisponível"}</span>
                        <input
                          type="checkbox"
                          checked={available}
                          disabled={status === "archived"}
                          onChange={(event) => requestAvailabilityChange(property, event.target.checked)}
                        />
                        <i aria-hidden="true" />
                      </label>
                      <button className="admin-edit-button" type="button" onClick={() => {
                        setEditing(property);
                        setIsNew(false);
                      }}>Editar</button>
                      <div className="admin-menu-wrap">
                        <button className="admin-more-button" type="button" aria-label={`Mais ações para ${property.id}`} aria-expanded={openMenu === property.id} onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenu((current) => current === property.id ? null : property.id);
                        }}>Mais</button>
                        {openMenu === property.id && (
                          <div className="admin-action-menu" onClick={(event) => event.stopPropagation()}>
                            {status === "archived" ? (
                              <button type="button" onClick={() => { setStatus(property.id, "Disponível"); setOpenMenu(null); }}>Restaurar no site</button>
                            ) : (
                              <button type="button" onClick={() => { requestArchive(property); setOpenMenu(null); }}>Arquivar</button>
                            )}
                            <button className="danger" type="button" onClick={() => { requestDelete(property); setOpenMenu(null); }}>Excluir</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-empty">
            <Icon name="search" size={30} />
            <h2>Nenhum imóvel encontrado</h2>
            <p>Tente outro termo ou limpe o filtro de status.</p>
            <button className="admin-button admin-button-secondary" type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Limpar busca</button>
          </div>
        )}
      </section>
      )}

      {editing && <PropertyEditor property={editing} isNew={isNew} records={records} onClose={() => { setEditing(null); setIsNew(false); }} onSave={updateRecord} onUpload={uploadPhoto} />}
      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}
      <div className={`admin-toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </main>
  );
}
