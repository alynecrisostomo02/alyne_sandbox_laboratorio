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
import LuxWhatsApp from "./LuxWhatsApp";

const STATE_LABELS = {
  [LUX_STATES.IDLE]: "Pronta para atender",
  [LUX_STATES.LISTENING]: "Ouvindo você",
  [LUX_STATES.THINKING]: "Consultando opções...",
  [LUX_STATES.TALKING]: "Respondendo",
  [LUX_STATES.SUCCESS]: "Informações organizadas",
  [LUX_STATES.ALERT]: "Atenção importante",
  [LUX_STATES.ERROR_SOFT]: "Conexão instável",
  [LUX_STATES.CTA_WHATSAPP]: "Pronto para continuar",
};

export default function LuxAssistant() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(createAssistantSession);
  const [luxState, setLuxState] = useState(LUX_STATES.IDLE);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const openRef = useRef(false);
  const transitionTimersRef = useRef([]);

  const whatsappMessage = useMemo(
    () => buildWhatsAppSummary(session.context),
    [session.context]
  );
  const whatsappHref = useMemo(
    () => whatsappUrl(whatsappMessage),
    [whatsappMessage]
  );

  function clearTransitionTimers() {
    transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    transitionTimersRef.current = [];
  }

  function scheduleState(state, delay) {
    const timer = window.setTimeout(() => {
      if (openRef.current) setLuxState(state);
    }, delay);
    transitionTimersRef.current.push(timer);
  }

  function settleLuxState(nextSession) {
    clearTransitionTimers();
    if (!openRef.current) {
      setLuxState(LUX_STATES.IDLE);
      return;
    }
    setLuxState(LUX_STATES.TALKING);

    if (nextSession.completed) {
      scheduleState(LUX_STATES.SUCCESS, 760);
      scheduleState(LUX_STATES.CTA_WHATSAPP, 1500);
      return;
    }

    scheduleState(nextSession.nextState || LUX_STATES.LISTENING, 760);
  }

  useEffect(() => {
    if (!open) return undefined;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 80);

    function handleEscape(event) {
      if (event.key === "Escape") closeAssistant();
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [open, session.messages, busy]);

  useEffect(() => () => clearTransitionTimers(), []);

  function toggleAssistant() {
    const nextOpen = !openRef.current;
    openRef.current = nextOpen;
    setOpen(nextOpen);
    clearTransitionTimers();
    setLuxState(nextOpen ? LUX_STATES.LISTENING : LUX_STATES.IDLE);
  }

  function closeAssistant() {
    openRef.current = false;
    setOpen(false);
    clearTransitionTimers();
    setLuxState(LUX_STATES.IDLE);
  }

  function restartAssistant() {
    setSession(createAssistantSession());
    setInput("");
    setBusy(false);
    clearTransitionTimers();
    setLuxState(LUX_STATES.LISTENING);
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 40);
  }

  async function submitMessage(text) {
    const messageText = text.trim();
    if (!messageText || busy) return;

    const currentSession = session;
    setSession(stageUserMessage(currentSession, messageText));
    setInput("");
    setBusy(true);
    clearTransitionTimers();
    setLuxState(LUX_STATES.THINKING);

    try {
      const nextSession = await sendAssistantTurn(currentSession, messageText);
      setSession(nextSession);
      settleLuxState(nextSession);
    } catch {
      setSession((current) => appendAssistantError(current));
      setLuxState(openRef.current ? LUX_STATES.ERROR_SOFT : LUX_STATES.IDLE);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitMessage(input);
  }

  function handleInputChange(event) {
    setInput(event.target.value);
    if (!busy) setLuxState(LUX_STATES.LISTENING);
  }

  function handleWhatsAppClick() {
    clearTransitionTimers();
    setLuxState(LUX_STATES.CTA_WHATSAPP);
  }

  return (
    <>
      <LuxWhatsApp state={luxState} isOpen={open} onToggle={toggleAssistant} />

      <section
        id="lux-assistant-panel"
        className="lux-assistant-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="lux-assistant-title"
        hidden={!open}
      >
        <header className="lux-assistant-header">
          <div className="lux-header-brand">
            <span className="lux-leaf-accent" aria-hidden="true">🌿</span>
            <div>
              <p className="lux-assistant-kicker">Assistente da Alyne</p>
              <h2 id="lux-assistant-title" className="lux-assistant-title">Lux</h2>
            </div>
          </div>
          <div className="lux-assistant-actions">
            {session.messages.length > 1 ? (
              <button
                type="button"
                className="lux-btn-restart"
                onClick={restartAssistant}
                disabled={busy}
                title="Recomeçar conversa"
              >
                Recomeçar
              </button>
            ) : null}
            <button
              type="button"
              className="lux-assistant-close"
              aria-label="Fechar assistente da Lux"
              onClick={closeAssistant}
            >
              ×
            </button>
          </div>
        </header>

        <div className="lux-assistant-status-bar">
          <div className="lux-status-info" role="status" aria-live="polite">
            <span className={`lux-status-dot state-${luxState.replace("_", "-")}`} />
            <span className="lux-status-label">{STATE_LABELS[luxState]}</span>
          </div>
          <span className="lux-gold-divider" aria-hidden="true" />
        </div>

        <div className="lux-assistant-log" ref={logRef} aria-live="polite" aria-busy={busy}>
          {session.messages.map((message) => (
            <article
              key={message.id}
              className={`lux-message is-${message.role}${message.kind === "summary" ? " is-summary" : ""}`}
            >
              {message.role === "assistant" ? (
                <div className="lux-message-header">
                  <span className="lux-avatar-badge" aria-hidden="true">Lux 🌿</span>
                </div>
              ) : null}
              {message.kind === "summary" ? <strong>Resumo para a Alyne</strong> : null}
              <p className="lux-message-text">{message.text}</p>
            </article>
          ))}

          {busy ? (
            <div className="lux-thinking" aria-label="Lux está consultando o catálogo">
              <span className="lux-thinking-dots">
                <span />
                <span />
                <span />
              </span>
              <span className="lux-thinking-text">Lux está consultando o catálogo...</span>
            </div>
          ) : null}
        </div>

        {session.quickReplies.length ? (
          <div className="lux-quick-replies" aria-label="Sugestões de resposta">
            {session.quickReplies.map((reply) => (
              <button
                type="button"
                key={reply}
                disabled={busy}
                onClick={() => submitMessage(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        ) : null}

        <footer className="lux-assistant-footer">
          <div className="lux-footer-top">
            <a
              className="lux-whatsapp-secondary"
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              onClick={handleWhatsAppClick}
            >
              <span>Falar com Alyne no WhatsApp</span>
              <span className="lux-arrow-icon" aria-hidden="true">↗</span>
            </a>
          </div>

          <form className="lux-composer" onSubmit={handleSubmit}>
            <label htmlFor="lux-assistant-input" className="sr-only">Sua mensagem</label>
            <div className="lux-composer-inner">
              <input
                ref={inputRef}
                id="lux-assistant-input"
                name="lux-message"
                type="text"
                value={input}
                onChange={handleInputChange}
                onFocus={() => !busy && setLuxState(LUX_STATES.LISTENING)}
                placeholder="Digite sua mensagem..."
                autoComplete="off"
                disabled={busy}
              />
              <button
                type="submit"
                className="lux-composer-submit"
                disabled={busy || !input.trim()}
                aria-label="Enviar mensagem"
              >
                <span>Enviar</span>
                <span className="lux-submit-arrow" aria-hidden="true">➔</span>
              </button>
            </div>
          </form>
          <p className="lux-privacy-note">
            {LUX_MESSAGES.PRIVACY_NOTE}
          </p>
        </footer>
      </section>
    </>
  );
}
