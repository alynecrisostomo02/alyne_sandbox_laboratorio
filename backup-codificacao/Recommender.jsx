"use client";

import { useMemo, useState } from "react";
import { properties, typeLabels } from "../properties";
import { currency, navigate, whatsappFor } from "../utils";
import { Icon } from "./Icons";
import PropertyCard from "./PropertyCard";

const initialAnswers = {
  purpose: "",
  type: "",
  maxPrice: "",
  bedrooms: "",
  gated: "",
  features: [],
};

export default function Recommender({ favorites, onFavorite }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [finished, setFinished] = useState(false);

  const questions = [
    {
      key: "purpose",
      title: "VocÃª quer comprar ou alugar?",
      hint: "Comece pelo objetivo principal da sua busca.",
      options: [["venda", "Comprar"], ["locacao", "Alugar"]],
    },
    {
      key: "type",
      title: "Qual tipo de imÃ³vel procura?",
      hint: "Escolha a opÃ§Ã£o que mais combina com sua rotina.",
      options: Object.entries(typeLabels),
    },
    {
      key: "maxPrice",
      title: "Qual Ã© sua faixa de valor?",
      hint: answers.purpose === "locacao" ? "Considere o valor mensal desejado." : "Escolha o limite de investimento aproximado.",
      options: answers.purpose === "locacao"
        ? [["3000", "AtÃ© R$ 3 mil/mÃªs"], ["5000", "AtÃ© R$ 5 mil/mÃªs"], ["8000", "AtÃ© R$ 8 mil/mÃªs"], ["", "Prefiro conversar"]]
        : [["350000", "AtÃ© R$ 350 mil"], ["650000", "AtÃ© R$ 650 mil"], ["900000", "AtÃ© R$ 900 mil"], ["1300000", "AtÃ© R$ 1,3 milhÃ£o"]],
    },
    {
      key: "bedrooms",
      title: "Quantos quartos precisa?",
      hint: "Para lotes ou salas comerciais, escolha â€œNÃ£o se aplicaâ€.",
      options: [["1", "1 ou mais"], ["2", "2 ou mais"], ["3", "3 ou mais"], ["4", "4 ou mais"], ["0", "NÃ£o se aplica"]],
    },
    {
      key: "gated",
      title: "Prefere condomÃ­nio fechado?",
      hint: "Isso ajuda a priorizar o tipo de localizaÃ§Ã£o.",
      options: [["yes", "Sim, Ã© importante"], ["no", "NÃ£o Ã© necessÃ¡rio"], ["any", "Tanto faz"]],
    },
    {
      key: "features",
      title: "Quais caracterÃ­sticas sÃ£o importantes?",
      hint: "VocÃª pode marcar mais de uma ou seguir sem selecionar.",
      multi: true,
      options: [
        ["Piscina", "Piscina"],
        ["Ãrea gourmet", "Ãrea gourmet"],
        ["Energia solar", "Energia solar"],
        ["MÃ³veis planejados", "MÃ³veis planejados"],
        ["Mobiliado", "Mobiliado"],
      ],
    },
  ];

  const result = useMemo(() => {
    if (!finished) return { exact: [], nearby: [] };
    const scored = properties
      .filter((property) => property.status === "Disponível" && property.purpose === answers.purpose)
      .map((property) => {
        let score = 4;
        let exact = true;
        if (property.type === answers.type) score += 4;
        else exact = false;
        if (answers.maxPrice && property.price <= Number(answers.maxPrice)) score += 3;
        else if (answers.maxPrice) {
          exact = false;
          score += property.price <= Number(answers.maxPrice) * 1.18 ? 1 : 0;
        }
        if (answers.bedrooms === "0" || property.bedrooms >= Number(answers.bedrooms)) score += 2;
        else exact = false;
        const isGated = property.type === "condominio" || property.features.includes("CondomÃ­nio fechado");
        if (answers.gated === "yes") {
          if (isGated) score += 2;
          else exact = false;
        }
        if (answers.gated === "no") {
          if (!isGated) score += 1;
          else exact = false;
        }
        answers.features.forEach((feature) => {
          const has = feature === "Mobiliado" ? property.furnished : property.features.includes(feature);
          if (has) score += 1;
          else exact = false;
        });
        return { property, score, exact };
      })
      .sort((a, b) => b.score - a.score);
    const exact = scored.filter((item) => item.exact).map((item) => item.property);
    return {
      exact,
      nearby: (exact.length ? scored : scored.slice(0, 3)).map((item) => item.property),
    };
  }, [answers, finished]);

  function choose(value) {
    const question = questions[step];
    if (question.multi) {
      setAnswers((current) => ({
        ...current,
        features: current.features.includes(value)
          ? current.features.filter((item) => item !== value)
          : [...current.features, value],
      }));
      return;
    }
    setAnswers((current) => ({ ...current, [question.key]: value }));
    if (step < questions.length - 1) {
      window.setTimeout(() => setStep((current) => current + 1), 120);
    }
  }

  function complete() {
    setFinished(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setAnswers(initialAnswers);
    setStep(0);
    setFinished(false);
  }

  if (finished) {
    const displayed = result.exact.length ? result.exact : result.nearby;
    return (
      <main className="recommender-page">
        <section className="page-banner compact">
          <div className="container result-banner">
            <div>
              <p className="eyebrow">Resultado da busca guiada</p>
              <h1>{result.exact.length ? "Encontramos boas combinaÃ§Ãµes." : "Encontramos opÃ§Ãµes prÃ³ximas."}</h1>
              <p>
                {result.exact.length
                  ? `${result.exact.length} ${result.exact.length === 1 ? "imÃ³vel combina" : "imÃ³veis combinam"} com as suas escolhas.`
                  : "Nenhum imÃ³vel corresponde a todos os critÃ©rios, entÃ£o priorizamos as alternativas mais compatÃ­veis."}
              </p>
            </div>
            <button className="button button-light" type="button" onClick={restart}>Refazer busca</button>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="recommendation-summary">
              <span>Seu perfil</span>
              <strong>{answers.purpose === "venda" ? "Compra" : "LocaÃ§Ã£o"} Â· {typeLabels[answers.type]}</strong>
              <small>
                {answers.maxPrice ? `AtÃ© ${currency.format(Number(answers.maxPrice))}` : "Valor a conversar"}
                {answers.bedrooms !== "0" ? ` Â· ${answers.bedrooms}+ quartos` : ""}
              </small>
            </div>
            {displayed.length > 0 ? (
              <div className="property-grid">
                {displayed.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    favorite={favorites.includes(property.id)}
                    onFavorite={onFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h2>Ainda nÃ£o hÃ¡ uma opÃ§Ã£o prÃ³xima</h2>
                <p>Conte seu perfil para que a equipe possa ajudar de forma personalizada.</p>
              </div>
            )}
            <div className="recommendation-help">
              <div>
                <h2>Quer ampliar as possibilidades?</h2>
                <p>Fale com a equipe e explique o que Ã© indispensÃ¡vel para vocÃª.</p>
              </div>
              <a className="button button-primary" href={whatsappFor()} target="_blank" rel="noreferrer">
                <Icon name="whatsapp" size={19} /> Falar no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const current = questions[step];
  const selected = current.multi ? answers.features : answers[current.key];

  return (
    <main className="recommender-page">
      <section className="recommender-shell">
        <div className="recommender-aside">
          <button className="brand brand-inverse" type="button" onClick={() => navigate("#/")}>
            <span className="brand-mark" aria-hidden="true">A</span>
            <span><strong>Busca guiada</strong><small>ImÃ³veis em RedenÃ§Ã£o</small></span>
          </button>
          <div>
            <p className="eyebrow">Passo {step + 1} de {questions.length}</p>
            <h1>Vamos encontrar as melhores opÃ§Ãµes para vocÃª.</h1>
            <p>Uma pergunta por vez, sem cadastros e sem guardar dados pessoais.</p>
          </div>
          <button className="back-site-link" type="button" onClick={() => navigate("#/imoveis")}>
            Voltar ao catÃ¡logo
          </button>
        </div>
        <div className="recommender-content">
          <div className="progress-track" aria-label={`Etapa ${step + 1} de ${questions.length}`}>
            <span style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
          </div>
          <div className="question-card">
            <span className="question-step">0{step + 1}</span>
            <h2>{current.title}</h2>
            <p>{current.hint}</p>
            <div className={`answer-grid ${current.multi ? "multi" : ""}`}>
              {current.options.map(([value, label]) => {
                const active = current.multi ? selected.includes(value) : selected === value;
                return (
                  <button
                    type="button"
                    key={label}
                    className={active ? "selected" : ""}
                    aria-pressed={active}
                    onClick={() => choose(value)}
                  >
                    <span>{label}</span>
                    <i><Icon name={active ? "check" : "arrow"} size={17} /></i>
                  </button>
                );
              })}
            </div>
            <div className="question-actions">
              <button className="button button-ghost" type="button" disabled={step === 0} onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}>
                Voltar
              </button>
              {current.multi ? (
                <button className="button button-primary" type="button" onClick={complete}>
                  Ver recomendaÃ§Ãµes <Icon name="arrow" size={18} />
                </button>
              ) : (
                <span>Selecione uma opÃ§Ã£o para continuar</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

