"use client";

import { useMemo, useState } from "react";
import { typeLabels } from "../properties";
import { currency, navigate, whatsappFor } from "../utils";
import { hasNumericPrice, isRecommendableProperty, propertyBedroomTotal, propertyHasFeature } from "../propertyStatus";
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

function isCondominiumProperty(property) {
  const location = [property.neighborhood, property.publicLocation].filter(Boolean).join(" ");
  return /condom[ií]nio/i.test(location);
}

function matchesLocationPreference(property, preference) {
  if (preference === "yes") return isCondominiumProperty(property);
  if (preference === "no") return !isCondominiumProperty(property);
  return true;
}

export default function Recommender({ properties, favorites, onFavorite }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [finished, setFinished] = useState(false);

  const questions = [
    {
      key: "purpose",
      title: "Você quer comprar ou alugar?",
      hint: "Comece pelo objetivo principal da sua busca.",
      options: [["venda", "Comprar"], ["locacao", "Alugar"]],
    },
    {
      key: "type",
      title: "Qual tipo de imóvel procura?",
      hint: "Escolha a opção que mais combina com sua rotina.",
      options: Object.entries(typeLabels),
    },
    {
      key: "maxPrice",
      title: "Qual é sua faixa de valor?",
      hint: answers.purpose === "locacao" ? "Considere o valor mensal desejado." : "Escolha o limite de investimento aproximado.",
      options: answers.purpose === "locacao"
        ? [["3000", "Até R$ 3 mil/mês"], ["5000", "Até R$ 5 mil/mês"], ["8000", "Até R$ 8 mil/mês"], ["", "Prefiro conversar"]]
        : [["350000", "Até R$ 350 mil"], ["650000", "Até R$ 650 mil"], ["900000", "Até R$ 900 mil"], ["1300000", "Até R$ 1,3 milhão"]],
    },
    {
      key: "bedrooms",
      title: "Quantos quartos precisa?",
      hint: "Para lotes ou salas comerciais, escolha “Não se aplica”.",
      options: [["1", "1 ou mais"], ["2", "2 ou mais"], ["3", "3 ou mais"], ["4", "4 ou mais"], ["0", "Não se aplica"]],
    },
    {
      key: "gated",
      title: "Prefere condomínio fechado ou bairro?",
      hint: "Escolha se a localização é obrigatória ou se aceita as duas opções.",
      options: [["yes", "Somente condomínio"], ["no", "Somente bairro"], ["any", "Tanto faz"]],
    },
    {
      key: "features",
      title: "Quais características são importantes?",
      hint: "Você pode marcar mais de uma ou seguir sem selecionar.",
      multi: true,
      options: [
        ["Piscina", "Piscina"],
        ["Área gourmet", "Área gourmet"],
        ["Energia solar", "Energia solar"],
        ["Móveis planejados", "Móveis planejados"],
        ["Mobiliado", "Mobiliado"],
      ],
    },
  ];

  const result = useMemo(() => {
    if (!finished) return { exact: [], nearby: [] };
    const scored = properties
      .filter((property) => (
        isRecommendableProperty(property)
        && property.purpose === answers.purpose
        && matchesLocationPreference(property, answers.gated)
      ))
      .map((property) => {
        let score = 4;
        let exact = true;
        if (property.type === answers.type) score += 4;
        else exact = false;
        if (answers.maxPrice && hasNumericPrice(property) && property.price <= Number(answers.maxPrice)) score += 3;
        else if (answers.maxPrice) {
          exact = false;
          score += hasNumericPrice(property) && property.price <= Number(answers.maxPrice) * 1.18 ? 1 : 0;
        }
        if (answers.bedrooms === "0" || propertyBedroomTotal(property) >= Number(answers.bedrooms)) score += 2;
        else exact = false;
        answers.features.forEach((feature) => {
          const aliases = {
            "Piscina": ["piscina"],
            "Área gourmet": ["área gourmet", "espaço gourmet", "gourmet"],
            "Energia solar": ["energia solar"],
            "Móveis planejados": ["planejad", "marcenaria planejada", "armários planejados"],
            "Mobiliado": ["mobiliad", "móveis inclusos"],
          };
          const has = feature === "Mobiliado"
            ? property.furnished === true
            : propertyHasFeature(property, aliases[feature] || feature);
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
  }, [answers, finished, properties]);

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
    if (step < questions.length - 1) setStep((current) => current + 1);
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
              <h1>{result.exact.length ? "Encontramos boas combinações." : "Encontramos opções próximas."}</h1>
              <p>
                {result.exact.length
                  ? `${result.exact.length} ${result.exact.length === 1 ? "imóvel combina" : "imóveis combinam"} com as suas escolhas.`
                  : "Nenhum imóvel corresponde a todos os critérios, então priorizamos as alternativas mais compatíveis."}
              </p>
            </div>
            <button className="button button-light" type="button" onClick={restart}>Refazer busca</button>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="recommendation-summary">
              <span>Seu perfil</span>
              <strong>{answers.purpose === "venda" ? "Compra" : "Locação"} · {typeLabels[answers.type]}</strong>
              <small>
                {answers.maxPrice ? `Até ${currency.format(Number(answers.maxPrice))}` : "Valor a conversar"}
                {answers.bedrooms !== "0" ? ` · ${answers.bedrooms}+ quartos` : ""}
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
                <h2>Ainda não há uma opção próxima</h2>
                <p>Conte seu perfil para que a equipe possa ajudar de forma personalizada.</p>
              </div>
            )}
            <div className="recommendation-help">
              <div>
                <h2>Quer ampliar as possibilidades?</h2>
                <p>Fale com a equipe e explique o que é indispensável para você.</p>
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
            <span className="context-brand-logo" aria-hidden="true">
              <img src="/branding/logo-alyne-padrao.jpg" alt="" />
            </span>
            <span><strong>Busca guiada</strong><small>Imóveis em Redenção</small></span>
          </button>
          <div>
            <p className="eyebrow">Passo {step + 1} de {questions.length}</p>
            <h1>Vamos encontrar as melhores opções para você.</h1>
            <p>Uma pergunta por vez, sem cadastros e sem guardar dados pessoais.</p>
          </div>
          <button className="back-site-link" type="button" onClick={() => navigate("#/imoveis")}>
            Voltar ao catálogo
          </button>
        </div>
        <div className="recommender-content">
          <div className="progress-track" role="progressbar" aria-label="Progresso da busca guiada" aria-valuemin="1" aria-valuemax={questions.length} aria-valuenow={step + 1}>
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
                  Ver recomendações <Icon name="arrow" size={18} />
                </button>
              ) : (
                <span>Selecione uma opção para continuar</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

