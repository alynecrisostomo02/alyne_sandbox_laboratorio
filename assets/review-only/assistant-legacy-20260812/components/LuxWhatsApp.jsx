"use client";

import { useEffect, useRef, useState } from "react";

const HOVER_HOLD_DELAY = 1400;
const RECOGNITION_DURATION = 660;
const SCROLL_IDLE_DELAY = 350;
const SCROLL_THRESHOLD = 5;

export default function LuxWhatsApp({ state = "idle", isOpen = false, onToggle }) {
  const linkRef = useRef(null);
  const holdTimerRef = useRef(null);
  const recognitionTimerRef = useRef(null);
  const recognitionFrameRef = useRef(null);
  const scrollIdleTimerRef = useRef(null);
  const scrollFrameRef = useRef(null);
  const [hoverHold, setHoverHold] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("idle");

  useEffect(() => {
    return () => {
      window.clearTimeout(holdTimerRef.current);
      window.clearTimeout(recognitionTimerRef.current);
      window.clearTimeout(scrollIdleTimerRef.current);
      window.cancelAnimationFrame(recognitionFrameRef.current);
      window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (reducedMotionRequested()) return undefined;

    let lastScrollY = Math.max(0, window.scrollY);

    function handleScroll() {
      if (scrollFrameRef.current) return;

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        const nextScrollY = Math.max(0, window.scrollY);
        const delta = nextScrollY - lastScrollY;

        if (Math.abs(delta) < SCROLL_THRESHOLD) return;

        lastScrollY = nextScrollY;
        const direction = delta > 0 ? "down" : "up";
        setScrollDirection((current) => current === direction ? current : direction);
        window.clearTimeout(scrollIdleTimerRef.current);
        scrollIdleTimerRef.current = window.setTimeout(
          () => setScrollDirection("idle"),
          SCROLL_IDLE_DELAY
        );
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(scrollIdleTimerRef.current);
      window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  function reducedMotionRequested() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }

  function beginRecognition() {
    window.clearTimeout(holdTimerRef.current);
    setHoverHold(false);
    holdTimerRef.current = window.setTimeout(() => setHoverHold(true), HOVER_HOLD_DELAY);
  }

  function endRecognition() {
    window.clearTimeout(holdTimerRef.current);
    setHoverHold(false);
    const element = linkRef.current;
    if (!element) return;
    element.style.setProperty("--lux-look-x", "0px");
    element.style.setProperty("--lux-look-y", "0px");
  }

  function trackPointer(event) {
    if (event.pointerType !== "mouse" || reducedMotionRequested()) return;
    const element = linkRef.current;
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2)));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2)));

    element.style.setProperty("--lux-look-x", `${(x * 2.4).toFixed(2)}px`);
    element.style.setProperty("--lux-look-y", `${(y * 1.6).toFixed(2)}px`);
  }

  function acknowledgeAssistant(event) {
    event.preventDefault();
    event.stopPropagation();

    window.clearTimeout(recognitionTimerRef.current);
    window.cancelAnimationFrame(recognitionFrameRef.current);

    if (!isOpen && !reducedMotionRequested()) {
      setRecognitionActive(false);
      recognitionFrameRef.current = window.requestAnimationFrame(() => {
        setRecognitionActive(true);
        recognitionTimerRef.current = window.setTimeout(
          () => setRecognitionActive(false),
          RECOGNITION_DURATION
        );
      });
    } else {
      setRecognitionActive(false);
    }

    onToggle?.();
  }

  const className = [
    "lux-whatsapp",
    `lux-state-${state.replace("_", "-")}`,
    scrollDirection !== "idle" ? `is-scroll-${scrollDirection}` : "",
    isOpen ? "is-open" : "",
    hoverHold ? "is-hover-hold" : "",
    recognitionActive ? "is-recognizing" : "",
  ].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      ref={linkRef}
      className={className}
      aria-label={isOpen ? "Fechar assistente do Lux" : "Abrir assistente do Lux"}
      aria-expanded={isOpen}
      aria-controls="lux-assistant-panel"
      aria-haspopup="dialog"
      onPointerEnter={beginRecognition}
      onPointerMove={trackPointer}
      onPointerLeave={endRecognition}
      onFocus={beginRecognition}
      onBlur={endRecognition}
      onClick={acknowledgeAssistant}
    >
      <span className="lux-visual" aria-hidden="true">
        <span className="lux-halo" />
        <span className="lux-body">
          <img className="lux-mascot-layer lux-torso-layer" src="/mascote/lux-look-a.webp" alt="" width="576" height="720" draggable="false" />
          <img className="lux-mascot-layer lux-head-layer" src="/mascote/lux-look-a.webp" alt="" width="576" height="720" draggable="false" />
          <img className="lux-mascot-layer lux-ear-layer" src="/mascote/lux-look-a.webp" alt="" width="576" height="720" draggable="false" />
          <img className="lux-mascot-layer lux-eye-layer lux-eye-layer-left" src="/mascote/lux-look-a.webp" alt="" width="576" height="720" draggable="false" />
          <img className="lux-mascot-layer lux-eye-layer lux-eye-layer-right" src="/mascote/lux-look-a.webp" alt="" width="576" height="720" draggable="false" />
          <span className="lux-eyelid lux-eyelid-left" />
          <span className="lux-eyelid lux-eyelid-right" />
          <span className="lux-sheen" />
        </span>
      </span>
      <span className="lux-copy">
        <strong>Lux</strong>
        <small>{isOpen ? "Fechar conversa" : "Como posso ajudar?"}</small>
      </span>
    </button>
  );
}
