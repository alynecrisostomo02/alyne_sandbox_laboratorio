"use client";

import { navigate } from "../utils";

export default function AssistantLauncher() {
  return (
    <button
      type="button"
      className="crisostomo-launcher"
      onClick={() => navigate("#/assistente")}
      aria-label="Abrir a página da Assistente Crisostomo"
    >
      <span className="crisostomo-launcher-image" aria-hidden="true">
        <img src="/assistente/assistente-crisostomo.png" alt="" width="1123" height="1401" />
      </span>
      <span className="crisostomo-launcher-copy">
        <strong>Assistente Crisostomo</strong>
        <small>Como posso ajudar?</small>
      </span>
    </button>
  );
}
