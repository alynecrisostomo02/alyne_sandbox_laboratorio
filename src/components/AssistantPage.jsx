"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { whatsappUrl } from "../config";
import { navigate } from "../utils";
import styles from "./AssistantPage.module.css";

const TOTAL_STEPS = 6;

const INITIAL_FORM = {
  purpose: "Comprar Imóvel",
  propertyType: "Casa Residencial",
  region: "Parque dos Buritis",
  customRegion: "",
  budget: "R$ 350 mil a R$ 600 mil",
  bedrooms: "3 quartos",
  suites: "1 suíte",
  garage: "2 vagas",
  features: ["Piscina", "Área Gourmet"],
  notes: "",
  clientName: "",
};

const PURPOSES = [
  ["Comprar Imóvel", "Quero adquirir para morar ou investir"],
  ["Alugar Imóvel", "Procuro opções para locação residencial/comercial"],
  ["Anunciar meu Imóvel", "Quero vender ou alugar com a Alyne"],
];

const PROPERTY_TYPES = [
  "Casa Residencial",
  "Apartamento",
  "Terreno / Lote",
  "Comercial / Sala",
  "Galpão",
];

const REGIONS = [
  "Parque dos Buritis",
  "Alto Paraná",
  "Morada da Paz",
  "Centro",
  "Vila Paulista",
  "Park dos Buritis",
  "Santos Dumont",
  "Outro bairro",
];

const BUDGETS = [
  ["Até R$ 350 mil", "Imóveis de entrada, lotes e casas compactas"],
  ["R$ 350 mil a R$ 600 mil", "Casas padrão, 3 quartos e ótima valorização"],
  ["R$ 600 mil a R$ 1 milhão", "Imóveis modernos com suíte, piscina e área gourmet"],
  ["Acima de R$ 1 milhão", "Casas de alto padrão, condomínio fechado e acabamento prime"],
  ["A combinar / Sob consulta", "Aberto a opções e análise de propostas"],
  ["Aceita Financiamento", "Pretendo utilizar carta de crédito ou financiamento bancário"],
];

const BEDROOMS = ["1 quarto", "2 quartos", "3 quartos", "4+ quartos"];
const SUITES = ["Sem preferência", "1 suíte", "2 suítes", "3+ suítes"];
const GARAGES = ["1 vaga", "2 vagas", "3+ vagas", "Tanto faz"];
const FEATURES = [
  "Piscina",
  "Área Gourmet",
  "Churrasqueira",
  "Energia Solar",
  "Condomínio Fechado",
  "Móveis Planejados",
  "Terreno Amplo / Quintal",
  "Poço Artesiano",
  "Pronto para Morar",
];

function buildLocalFallback(form) {
  const region = form.region === "Outro bairro" && form.customRegion.trim()
    ? form.customRegion.trim()
    : form.region;
  const name = form.clientName.trim();
  const features = form.features.length ? form.features.join(", ") : "Nenhum específico";
  return `Olá, Alyne Crisóstomo! ${name ? `Meu nome é ${name}. ` : ""}Preenchi a Busca Guiada no site e gostaria de atendimento para ${form.purpose.toLowerCase()} (${form.propertyType}) em ${region}.\n\n• Orçamento: ${form.budget}\n• Quartos: ${form.bedrooms}\n• Suítes: ${form.suites}\n• Garagem: ${form.garage}\n• Diferenciais: ${features}${form.notes.trim() ? `\n• Observações: \"${form.notes.trim()}\"` : ""}`;
}

function ChoiceCard({ selected, title, description, onClick, compact = false }) {
  return (
    <button
      type="button"
      className={`${styles.choice} assistant-theme-choice ${selected ? styles.choiceSelected : ""} ${compact ? styles.choiceCompact : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className={styles.choiceTitle}>{title}</span>
      {description ? <small>{description}</small> : null}
      <span className={styles.check}>{selected ? "✓" : ""}</span>
    </button>
  );
}

function StepHeading({ number, eyebrow, title, description }) {
  return (
    <div className={styles.stepHeading}>
      <span className={styles.stepEyebrow}>{String(number).padStart(2, "0")}. {eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default function AssistantPage() {
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState("transition");
  const [transitionDirection, setTransitionDirection] = useState("forward");
  const [isStepExiting, setIsStepExiting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [resultSource, setResultSource] = useState("");
  const [copied, setCopied] = useState(false);
  const stepTimerRef = useRef(null);

  useEffect(() => () => {
    if (stepTimerRef.current) window.clearTimeout(stepTimerRef.current);
  }, []);

  const regionLabel = useMemo(
    () => form.region === "Outro bairro" && form.customRegion.trim() ? form.customRegion.trim() : form.region,
    [form.region, form.customRegion]
  );

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  function patch(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleFeature(feature) {
    setForm((current) => ({
      ...current,
      features: current.features.includes(feature)
        ? current.features.filter((item) => item !== feature)
        : [...current.features, feature],
    }));
  }

  function changeStep(nextStep) {
    const boundedStep = Math.max(1, Math.min(TOTAL_STEPS, nextStep));
    if (boundedStep === step || isStepExiting) return;
    setTransitionDirection(boundedStep > step ? "forward" : "back");
    setIsStepExiting(true);
    if (stepTimerRef.current) window.clearTimeout(stepTimerRef.current);
    stepTimerRef.current = window.setTimeout(() => {
      setStep(boundedStep);
      setIsStepExiting(false);
      stepTimerRef.current = null;
    }, 180);
  }

  function restart() {
    if (stepTimerRef.current) window.clearTimeout(stepTimerRef.current);
    setStep(1);
    setTransitionDirection("forward");
    setIsStepExiting(false);
    setForm(INITIAL_FORM);
    setResult("");
    setIsResultOpen(false);
    setResultSource("");
    setCopied(false);
  }

  async function finish() {
    if (isGenerating) return;
    setIsGenerating(true);
    setCopied(false);

    const payload = {
      clientName: form.clientName.trim(),
      purpose: form.purpose,
      propertyType: form.propertyType,
      region: regionLabel,
      budget: form.budget,
      bedrooms: form.bedrooms,
      suites: form.suites,
      garage: form.garage,
      features: form.features,
      notes: form.notes.trim(),
    };

    try {
      const response = await fetch("/api/format-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data?.message) throw new Error("FORMAT_FAILED");
      setResult(data.message);
      setIsResultOpen(true);
      setResultSource(data.source || "fallback");
    } catch {
      setResult(buildLocalFallback(form));
      setIsResultOpen(true);
      setResultSource("fallback");
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className={`${styles.page} assistant-theme-root`} data-assistant-theme={theme}>
      <div className={styles.ambient} aria-hidden="true">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <g className={styles.architecture}>
            <path d="M120 650V420l150-95 150 95v230M175 650V485h85v165M308 650V500h65v150" />
            <path d="M790 650V385h250v265M835 650V455h75v195M950 650V455h55v195M765 385l150-105 155 105" />
            <path d="M505 650V500h190v150M545 500v-75h110v75M540 570h120" />
          </g>
          <g className={styles.botanical}>
            <path d="M70 805C90 620 135 490 260 340" />
            <path d="M115 650c-70-5-96-42-105-88 63-8 104 20 105 88ZM150 555c-64-18-80-56-77-101 61 4 96 39 77 101ZM195 465c-48-30-53-67-38-105 51 18 73 58 38 105Z" />
            <path d="M1120 805c-20-185-65-315-190-465" />
            <path d="M1075 650c70-5 96-42 105-88-63-8-104 20-105 88ZM1040 555c64-18 80-56 77-101-61 4-96 39-77 101ZM995 465c48-30 53-67 38-105-51 18-73 58-38 105Z" />
          </g>
        </svg>
      </div>

      <header className={`${styles.topbar} assistant-theme-topbar`}>
        <button type="button" className={`${styles.backButton} assistant-theme-back`} onClick={() => navigate("#/")}>← Voltar ao site</button>
        <div className={`${styles.brandBlock} assistant-theme-brand`}>
          <span className={styles.brandMark}>AC</span>
          <div>
            <strong>Assistente Crisóstomo</strong>
            <small>Busca Guiada • Redenção, Pará</small>
          </div>
        </div>
        <div className="assistant-theme-actions">
          <span className={styles.status}><i /> Atendimento guiado</span>
          <div className="assistant-theme-switcher" role="group" aria-label="Tema da Assistente">
            <button type="button" className={theme === "botanical" ? "is-active" : ""} onClick={() => setTheme("botanical")} aria-pressed={theme === "botanical"} aria-label="Jardim Botânico" title="Jardim Botânico">☀</button>
            <button type="button" className={theme === "transition" ? "is-active" : ""} onClick={() => setTheme("transition")} aria-pressed={theme === "transition"} aria-label="Botânico para Noturno" title="Botânico para Noturno">✦</button>
            <button type="button" className={theme === "night" ? "is-active" : ""} onClick={() => setTheme("night")} aria-pressed={theme === "night"} aria-label="Jardim Noturno" title="Jardim Noturno">☾</button>
          </div>
        </div>
      </header>

      <section className={`${styles.shell} assistant-theme-shell`}>
        <i className={`${styles.corner} ${styles.cornerTl}`} aria-hidden="true" />
        <i className={`${styles.corner} ${styles.cornerTr}`} aria-hidden="true" />
        <i className={`${styles.corner} ${styles.cornerBl}`} aria-hidden="true" />
        <i className={`${styles.corner} ${styles.cornerBr}`} aria-hidden="true" />

        <div className={`${styles.reception} assistant-theme-reception`}>
          <div>
            <span className={styles.kicker}>ATENDIMENTO PERSONALIZADO</span>
            <h1>Vamos organizar o imóvel que você procura.</h1>
            <p>Escolha suas preferências com calma. No final, a Assistente organiza tudo em uma mensagem pronta para falar diretamente com a Alyne.</p>
          </div>
          <div className={`${styles.receptionBadge} assistant-theme-badge`}>
            <span>IA</span>
            <strong>só no final</strong>
            <small>para organizar sua mensagem</small>
          </div>
        </div>

        <div className={`${styles.progressHeader} assistant-theme-progress`}>
          <div className={styles.progressCopy}>
            <span className={styles.compass}>◇</span>
            <div>
              <strong>Busca Guiada de Imóveis</strong>
              <small>Passo {step} de {TOTAL_STEPS} • {progress}% concluído</small>
            </div>
          </div>
          <div className={styles.dots} aria-label={`Passo ${step} de ${TOTAL_STEPS}`}>
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.dot} assistant-theme-dot ${step === index + 1 ? styles.dotActive : ""} ${step > index + 1 ? styles.dotDone : ""}`}
                onClick={() => changeStep(index + 1)}
                aria-label={`Ir para o passo ${index + 1}`}
                aria-current={step === index + 1 ? "step" : undefined}
              />
            ))}
          </div>
        </div>

        <div className={styles.stepViewport}>
          <section
            key={step}
            className={`${styles.stepContent} assistant-step-transition assistant-step-${transitionDirection} ${isStepExiting ? "assistant-step-exit" : "assistant-step-enter"}`}
          >
            {step === 1 ? (
              <>
                <StepHeading number={1} eyebrow="Objetivo & Categoria" title="O que você deseja realizar em Redenção?" description="Selecione a finalidade e a categoria principal do imóvel pretendido." />
                <div className={styles.fieldGroup}>
                  <label>Finalidade</label>
                  <div className={styles.gridThree}>
                    {PURPOSES.map(([title, description]) => (
                      <ChoiceCard key={title} title={title} description={description} selected={form.purpose === title} onClick={() => patch("purpose", title)} />
                    ))}
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label>Tipo de imóvel</label>
                  <div className={styles.gridFive}>
                    {PROPERTY_TYPES.map((title) => (
                      <ChoiceCard key={title} title={title} selected={form.propertyType === title} onClick={() => patch("propertyType", title)} compact />
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <StepHeading number={2} eyebrow="Bairro / Região" title="Em qual região ou bairro de Redenção você prefere?" description="Escolha uma região ou informe outro bairro de preferência." />
                <div className={styles.gridFour}>
                  {REGIONS.map((title) => (
                    <ChoiceCard key={title} title={title} selected={form.region === title} onClick={() => patch("region", title)} compact />
                  ))}
                </div>
                {form.region === "Outro bairro" ? (
                  <div className={`${styles.inputGroup} assistant-theme-input`}>
                    <label htmlFor="custom-region">Informe o bairro ou ponto de referência</label>
                    <input id="custom-region" value={form.customRegion} onChange={(event) => patch("customRegion", event.target.value)} placeholder="Ex: próximo à Avenida Brasil, Planalto..." maxLength={120} />
                  </div>
                ) : null}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <StepHeading number={3} eyebrow="Orçamento Estimado" title="Qual é a sua faixa de investimento pretendida?" description="Isso ajuda a Alyne a entender rapidamente quais opções fazem sentido para você." />
                <div className={styles.gridTwo}>
                  {BUDGETS.map(([title, description]) => (
                    <ChoiceCard key={title} title={title} description={description} selected={form.budget === title} onClick={() => patch("budget", title)} />
                  ))}
                </div>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <StepHeading number={4} eyebrow="Estrutura & Cômodos" title="Como deve ser a divisão dos cômodos?" description="Defina quartos, suítes e vagas de garagem." />
                <div className={styles.structureGrid}>
                  <div className={styles.fieldGroup}>
                    <label>Quartos</label>
                    <div className={styles.miniGrid}>{BEDROOMS.map((title) => <ChoiceCard key={title} title={title} selected={form.bedrooms === title} onClick={() => patch("bedrooms", title)} compact />)}</div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label>Suítes</label>
                    <div className={styles.miniGrid}>{SUITES.map((title) => <ChoiceCard key={title} title={title} selected={form.suites === title} onClick={() => patch("suites", title)} compact />)}</div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label>Garagem</label>
                    <div className={styles.miniGrid}>{GARAGES.map((title) => <ChoiceCard key={title} title={title} selected={form.garage === title} onClick={() => patch("garage", title)} compact />)}</div>
                  </div>
                </div>
              </>
            ) : null}

            {step === 5 ? (
              <>
                <StepHeading number={5} eyebrow="Diferenciais & Itens Desejados" title="Quais diferenciais são importantes para você?" description="Você pode marcar vários itens ou avançar sem escolher nenhum." />
                <div className={styles.featureGrid}>
                  {FEATURES.map((feature) => (
                    <ChoiceCard key={feature} title={feature} selected={form.features.includes(feature)} onClick={() => toggleFeature(feature)} compact />
                  ))}
                </div>
              </>
            ) : null}

            {step === 6 ? (
              <>
                <StepHeading number={6} eyebrow="Conclusão & Identificação" title="Tudo quase pronto para falar com a Alyne!" description="Informe seu nome e qualquer detalhe adicional para personalizar seu atendimento." />
                <div className={styles.finalGrid}>
                  <div className={`${styles.inputGroup} assistant-theme-input`}>
                    <label htmlFor="client-name">Seu nome</label>
                    <input id="client-name" value={form.clientName} onChange={(event) => patch("clientName", event.target.value)} placeholder="Ex: Lucas Andrade" maxLength={120} />
                  </div>
                  <div className={`${styles.inputGroup} assistant-theme-input`}>
                    <label htmlFor="client-notes">Observações ou requisitos especiais <span>opcional</span></label>
                    <textarea id="client-notes" value={form.notes} onChange={(event) => patch("notes", event.target.value)} placeholder="Ex: procuro casa térrea, espaço para pet, fácil acesso..." rows={4} maxLength={1200} />
                  </div>
                </div>
                <div className={`${styles.summaryPreview} assistant-theme-summary`}>
                  <strong>✓ Resumo das escolhas</strong>
                  <p><b>{form.purpose}</b> ({form.propertyType}) em <b>{regionLabel}</b> • Orçamento: <b>{form.budget}</b> • {form.bedrooms} • {form.suites} • Garagem: {form.garage}</p>
                </div>
              </>
            ) : null}
          </section>
        </div>

        <footer className={`${styles.navigation} assistant-theme-navigation`}>
          <button type="button" className={`${styles.secondaryButton} assistant-theme-secondary`} onClick={() => changeStep(step - 1)} disabled={step === 1 || isStepExiting}>← Voltar</button>
          {step < TOTAL_STEPS ? (
            <button type="button" className={styles.primaryButton} onClick={() => changeStep(step + 1)} disabled={isStepExiting}>Avançar →</button>
          ) : (
            <button type="button" className={styles.finishButton} onClick={finish} disabled={isGenerating}>
              {isGenerating ? <><span className={styles.spinner} /> Organizando sua mensagem...</> : <>◉ Gerar mensagem para WhatsApp</>}
            </button>
          )}
        </footer>

        <div className={`${styles.privacy} assistant-theme-privacy`}>Privacidade: suas escolhas são usadas somente para organizar o seu atendimento com Alyne Crisóstomo.</div>
      </section>

      {isResultOpen ? (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="guided-result-title">
          <section className={`${styles.modal} assistant-theme-modal`}>
            <button type="button" className={`${styles.modalClose} assistant-theme-modal-close`} onClick={() => setIsResultOpen(false)} aria-label="Fechar">×</button>
            <span className={styles.modalIcon}>✓</span>
            <span className={styles.kicker}>BUSCA CONCLUÍDA</span>
            <h2 id="guided-result-title">Sua mensagem está pronta.</h2>
            <p className={styles.modalLead}>Revise antes de abrir o WhatsApp. A mensagem foi organizada {resultSource === "gemini" ? "com o Gemini" : "pelo modo seguro de fallback"}.</p>
            <textarea
              className={`${styles.messagePreview} assistant-message-editor`}
              value={result}
              onChange={(event) => {
                setResult(event.target.value);
                setCopied(false);
              }}
              rows={9}
              aria-label="Mensagem editável para WhatsApp"
            />
            <div className={styles.modalActions}>
              <button type="button" className={`${styles.secondaryButton} assistant-theme-secondary`} onClick={copyResult}>{copied ? "Copiado ✓" : "Copiar mensagem"}</button>
              <a className={styles.whatsappButton} href={whatsappUrl(result)} target="_blank" rel="noreferrer">Abrir WhatsApp ↗</a>
            </div>
            <button type="button" className={styles.restartButton} onClick={restart}>Refazer busca guiada</button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
