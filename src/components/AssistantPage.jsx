"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  appendAssistantError,
  buildWhatsAppSummary,
  createAssistantSession,
  sendAssistantTurn,
  stageUserMessage,
} from "../assistant/assistantController";
import { LUX_STATES } from "../assistant/assistantState";
import { LUX_MESSAGES } from "../assistant/luxMessages";
import { whatsappUrl } from "../config";

const INITIAL_OPTIONS = [
  "Quero comprar um imóvel",
  "Quero alugar um imóvel",
  "Explorar Redenção, Pará",
];

const STATE_LABELS = {
  [LUX_STATES.IDLE]: "Pronta para conversar",
  [LUX_STATES.LISTENING]: "Ouvindo você",
  [LUX_STATES.THINKING]: "Analisando sua mensagem",
  [LUX_STATES.TALKING]: "Respondendo",
  [LUX_STATES.SUCCESS]: "Informações organizadas",
  [LUX_STATES.ALERT]: "Atenção importante",
  [LUX_STATES.ERROR_SOFT]: "Conexão instável",
  [LUX_STATES.CTA_WHATSAPP]: "Pronta para continuar",
};

export default function AssistantPage() {
  const [session, setSession] = useState(createAssistantSession);
  const [assistantState, setAssistantState] = useState(LUX_STATES.IDLE);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const timersRef = useRef([]);

  const whatsappMessage = useMemo(
    () => buildWhatsAppSummary(session.context),
    [session.context]
  );
  const whatsappHref = useMemo(
    () => whatsappUrl(whatsappMessage),
    [whatsappMessage]
  );
  const isBeginning = session.messages.length === 1 && !busy;

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function scheduleState(state, delay) {
    timersRef.current.push(window.setTimeout(() => setAssistantState(state), delay));
  }

  function settleState(nextSession) {
    clearTimers();
    setAssistantState(LUX_STATES.TALKING);
    if (nextSession.completed) {
      scheduleState(LUX_STATES.SUCCESS, 650);
      scheduleState(LUX_STATES.CTA_WHATSAPP, 1300);
      return;
    }
    scheduleState(nextSession.nextState || LUX_STATES.LISTENING, 650);
  }

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
    setAssistantState(LUX_STATES.LISTENING);
    return clearTimers;
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [session.messages, busy]);

  function restartAssistant() {
    clearTimers();
    setSession(createAssistantSession());
    setInput("");
    setBusy(false);
    setAssistantState(LUX_STATES.LISTENING);
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 40);
  }

  async function submitMessage(text) {
    const messageText = text.trim();
    if (!messageText || busy) return;

    const currentSession = session;
    setSession(stageUserMessage(currentSession, messageText));
    setInput("");
    setBusy(true);
    clearTimers();
    setAssistantState(LUX_STATES.THINKING);

    try {
      const nextSession = await sendAssistantTurn(currentSession, messageText);
      setSession(nextSession);
      settleState(nextSession);
    } catch {
      setSession((current) => appendAssistantError(current));
      setAssistantState(LUX_STATES.ERROR_SOFT);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitMessage(input);
  }

  return (
    <main className="crisostomo-assistant-page">
      <div className="crisostomo-assistant-orb orb-one" aria-hidden="true" />
      <div className="crisostomo-assistant-orb orb-two" aria-hidden="true" />

      <div className="crisostomo-assistant-shell">
        <section className="crisostomo-assistant-intro" aria-labelledby="assistant-page-title">
          <p className="crisostomo-assistant-eyebrow">ATENDIMENTO PERSONALIZADO</p>
          <h1 id="assistant-page-title">Assistente Crisostomo</h1>
          <p className="crisostomo-assistant-tagline">
            O imóvel certo começa com uma boa conversa.
          </p>

          <div className={`crisostomo-character state-${assistantState.replace("_", "-")}`}>
            <span className="crisostomo-character-ring ring-one" aria-hidden="true" />
            <span className="crisostomo-character-ring ring-two" aria-hidden="true" />
            <img
              src="/assistente/assistente-crisostomo.png"
              alt="Assistente Crisostomo sorrindo e estendendo a mão em boas-vindas"
              width="1123"
              height="1401"
            />
          </div>
        </section>

        <section className="crisostomo-conversation" aria-labelledby="assistant-conversation-title">
          <header className="crisostomo-conversation-header">
            <div>
              <p className="crisostomo-conversation-kicker">CONVERSA PARTICULAR</p>
              <h2 id="assistant-conversation-title">Como posso ajudar você hoje?</h2>
            </div>
            <div className="crisostomo-conversation-header-actions">
              <span className={`crisostomo-status-dot state-${assistantState.replace("_", "-")}`} aria-hidden="true" />
              <span className="crisostomo-status-text" role="status" aria-live="polite">
                {STATE_LABELS[assistantState]}
              </span>
              {session.messages.length > 1 ? (
                <button type="button" className="crisostomo-restart" onClick={restartAssistant} disabled={busy}>
                  Recomeçar
                </button>
              ) : null}
            </div>
          </header>

          <div
            className="crisostomo-conversation-log"
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-busy={busy}
            aria-relevant="additions text"
          >
            {session.messages.map((message) => (
              <article
                key={message.id}
                className={`crisostomo-message is-${message.role}${message.kind === "summary" ? " is-summary" : ""}`}
              >
                {message.role === "assistant" ? (
                  <span className="crisostomo-message-author">Assistente Crisostomo</span>
                ) : null}
                {message.kind === "summary" ? <strong>Resumo para a Alyne</strong> : null}
                <p>{message.text}</p>
              </article>
            ))}

            {busy ? (
              <div className="crisostomo-thinking" aria-label="Assistente Crisostomo está preparando uma resposta">
                <span /><span /><span />
                <small>Preparando uma resposta...</small>
              </div>
            ) : null}
          </div>

          {isBeginning ? (
            <div className="crisostomo-start-options" aria-label="Opções iniciais">
              {INITIAL_OPTIONS.map((option, index) => (
                <button type="button" key={option} onClick={() => submitMessage(option)}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {option}
                </button>
              ))}
            </div>
          ) : session.quickReplies.length ? (
            <div className="crisostomo-quick-replies" aria-label="Sugestões de resposta">
              {session.quickReplies.map((reply) => (
                <button type="button" key={reply} disabled={busy} onClick={() => submitMessage(reply)}>
                  {reply}
                </button>
              ))}
            </div>
          ) : null}

          <footer className="crisostomo-composer-area">
            <form className="crisostomo-composer" onSubmit={handleSubmit}>
              <label htmlFor="crisostomo-assistant-input">Conte o que você procura</label>
              <div className="crisostomo-composer-row">
                <input
                  ref={inputRef}
                  id="crisostomo-assistant-input"
                  name="assistant-message"
                  type="text"
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                    if (!busy) setAssistantState(LUX_STATES.LISTENING);
                  }}
                  onFocus={() => !busy && setAssistantState(LUX_STATES.LISTENING)}
                  placeholder="Escreva sua mensagem..."
                  autoComplete="off"
                  disabled={busy}
                />
                <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar mensagem">
                  Enviar <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>

            <div className="crisostomo-handoff">
              <p>{LUX_MESSAGES.PRIVACY_NOTE}</p>
              <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => setAssistantState(LUX_STATES.CTA_WHATSAPP)}>
                Falar com Alyne no WhatsApp <span aria-hidden="true">↗</span>
              </a>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
