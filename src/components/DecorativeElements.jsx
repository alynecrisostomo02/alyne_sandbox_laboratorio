"use client";

/**
 * ELEMENTOS VISUAIS INSPIRADOS NAS REFERÊNCIAS:
 * 1. Formas Orgânicas Abstratas & Botânica Linear (Imagens 1 e 3)
 * 2. Ramos Botânicos Minimalistas & Folhagens Finas (Imagens 2 e 4)
 * 3. Ondas Douradas Fluidas / Fitas Transparentes de Seda (Imagem 7)
 * 4. Folhagem Dourada Tropical com Textura Suave (Imagem 6)
 * 5. Ícones Arquitetônicos & Eco Real Estate com Casa e Folha (Imagem 8)
 * 
 * Todos aplicados com opacidade suave (~20% a 25%) e traços limpos.
 */

// 1. Composição Abstrata Orgânica (Manchas orgânicas suaves + Ramo Botânico em Linha + Pontilhismo sutil) - Imagens 1 e 3
export function OrganicBotanicalAbstract({
  className = "",
  size = 220,
  opacity = 0.24,
  variant = "sage", // "sage", "warm", "gold"
}) {
  const isGold = variant === "gold";
  const isWarm = variant === "warm";

  const blob1 = isGold ? "#d7b875" : isWarm ? "#cbbfae" : "#52796f";
  const blob2 = isGold ? "#f3e5c8" : isWarm ? "#ded4c7" : "#84a98c";
  const blob3 = isGold ? "#c6a15b" : isWarm ? "#b7a996" : "#2f5d50";
  const lineColor = isGold ? "#9f7a38" : isWarm ? "#5c5042" : "#12392f";

  return (
    <svg
      aria-hidden="true"
      className={`decorative-watermark organic-botanical-art ${className}`}
      width={size}
      height={size * 1.25}
      viewBox="0 0 160 200"
      fill="none"
      style={{ opacity, pointerEvents: "none" }}
    >
      {/* Formas Orgânicas Suaves (Blobs) */}
      <path
        d="M60 20 C100 15 140 45 130 90 C120 135 70 145 40 120 C10 95 20 25 60 20 Z"
        fill={blob2}
        fillOpacity="0.35"
      />
      <path
        d="M95 10 C130 15 145 50 135 80 C125 110 85 100 80 70 C75 40 60 5 95 10 Z"
        fill={blob1}
        fillOpacity="0.45"
      />
      <path
        d="M40 110 C75 105 95 130 85 160 C75 190 35 185 25 160 C15 135 5 115 40 110 Z"
        fill={blob3}
        fillOpacity="0.4"
      />

      {/* Pontilhismo / Stippling sutil */}
      <g fill={lineColor} fillOpacity="0.5">
        <circle cx="45" cy="180" r="1.8" />
        <circle cx="55" cy="178" r="2.2" />
        <circle cx="65" cy="182" r="1.6" />
        <circle cx="75" cy="179" r="2" />
        <circle cx="85" cy="184" r="1.8" />
        <circle cx="50" cy="188" r="2.4" />
        <circle cx="60" cy="190" r="1.8" />
        <circle cx="72" cy="188" r="2.2" />
        <circle cx="82" cy="192" r="1.5" />
      </g>

      {/* Ramo Botânico Linear Refinado com Folhas e Nervuras (Inspirado na Ref 1 e 3) */}
      <g stroke={lineColor} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Haste Principal */}
        <path d="M50 170 C60 125 75 75 90 30" />
        
        {/* Folha superior 1 */}
        <path d="M90 30 C95 15 85 5 70 8 C60 18 75 28 90 30 Z" fill={blob1} fillOpacity="0.2" />
        <path d="M80 18 L70 8" strokeWidth="0.9" />

        {/* Folha superior 2 */}
        <path d="M85 45 C105 38 115 25 110 12 C98 16 90 30 85 45 Z" fill={blob2} fillOpacity="0.25" />
        <path d="M95 32 L110 12" strokeWidth="0.9" />

        {/* Folhas medianas */}
        <path d="M76 75 C60 62 45 66 40 78 C52 86 66 82 76 75 Z" fill={blob1} fillOpacity="0.2" />
        <path d="M58 72 L40 78" strokeWidth="0.9" />
        
        <path d="M72 100 C92 90 108 95 114 110 C100 118 82 110 72 100 Z" fill={blob2} fillOpacity="0.2" />
        <path d="M92 102 L114 110" strokeWidth="0.9" />

        {/* Folhas inferiores */}
        <path d="M62 130 C46 120 30 128 32 142 C45 146 58 138 62 130 Z" fill={blob3} fillOpacity="0.25" />
        <path d="M47 132 L32 142" strokeWidth="0.9" />

        <path d="M56 150 C74 142 88 152 86 164 C72 168 62 160 56 150 Z" fill={blob1} fillOpacity="0.2" />
      </g>
    </svg>
  );
}

// 2. Ramo Botânico Fino e Elegante (Inspirado nas Imagens 2 e 4 - Linhas e Silhueta Orgânica)
export function FineBotanicalBranch({
  className = "",
  size = 180,
  opacity = 0.25,
  color = "#12392f",
  variant = "horizontal", // "horizontal" (Ref 4) ou "vertical" (Ref 2)
}) {
  if (variant === "horizontal") {
    return (
      <svg
        aria-hidden="true"
        className={`decorative-watermark fine-botanical-horizontal ${className}`}
        width={size * 2}
        height={size * 0.7}
        viewBox="0 0 320 120"
        fill="none"
        style={{ opacity, pointerEvents: "none" }}
      >
        <g stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Haste ondulada horizontal */}
          <path d="M10 85 C60 70 120 85 180 50 C240 15 280 40 310 25" strokeWidth="1.5" />
          
          {/* Brotos e folhas com nervuras translúcidas (Estilo X-Ray da Imagem 4) */}
          {/* Grupo 1 */}
          <path d="M40 78 C35 55 15 48 5 56 C15 75 30 78 40 78 Z" fill={color} fillOpacity="0.12" />
          <path d="M22 65 C12 60 5 56 5 56" strokeWidth="0.8" />
          
          <path d="M70 75 C75 52 95 45 105 52 C95 72 80 75 70 75 Z" fill={color} fillOpacity="0.12" />
          <path d="M88 62 C98 56 105 52 105 52" strokeWidth="0.8" />

          {/* Grupo 2 */}
          <path d="M130 72 C120 48 98 42 90 52 C102 70 118 72 130 72 Z" fill={color} fillOpacity="0.12" />
          <path d="M110 58 C100 54 90 52 90 52" strokeWidth="0.8" />

          <path d="M160 58 C172 35 195 30 205 38 C192 58 175 60 160 58 Z" fill={color} fillOpacity="0.12" />
          <path d="M182 46 C195 42 205 38 205 38" strokeWidth="0.8" />

          {/* Grupo 3 - Folhagens da ponta */}
          <path d="M210 40 C200 18 180 14 172 24 C185 40 198 42 210 40 Z" fill={color} fillOpacity="0.12" />
          <path d="M245 32 C255 10 278 8 286 18 C272 36 256 36 245 32 Z" fill={color} fillOpacity="0.14" />
          
          <path d="M275 32 C285 50 305 55 315 45 C302 30 288 28 275 32 Z" fill={color} fillOpacity="0.12" />
          <path d="M295 40 L315 45" strokeWidth="0.8" />
        </g>
      </svg>
    );
  }

  // Ramo Vertical (Inspirado na Imagem 2)
  return (
    <svg
      aria-hidden="true"
      className={`decorative-watermark fine-botanical-vertical ${className}`}
      width={size}
      height={size * 1.5}
      viewBox="0 0 100 160"
      fill="none"
      style={{ opacity, pointerEvents: "none" }}
    >
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Caule curvo orgânico */}
        <path d="M60 150 C55 110 48 70 50 15" strokeWidth="1.8" />
        
        {/* Folha Superior pontiaguda */}
        <path d="M50 15 C45 35 35 55 48 75 C58 55 52 30 50 15 Z" fill={color} fillOpacity="0.18" />
        
        {/* Folhas Laterais */}
        <path d="M48 60 C32 45 18 52 14 68 C28 76 42 70 48 60 Z" fill={color} fillOpacity="0.18" />
        <path d="M51 85 C68 70 82 78 85 92 C72 102 58 95 51 85 Z" fill={color} fillOpacity="0.18" />
        <path d="M54 110 C38 95 24 102 22 118 C35 128 48 122 54 110 Z" fill={color} fillOpacity="0.18" />
        <path d="M56 130 C68 120 78 124 82 136 C72 144 62 138 56 130 Z" fill={color} fillOpacity="0.18" />
      </g>
    </svg>
  );
}

// 3. Onda Dourada Fluida & Fita Translúcida (Inspirada na Imagem 7)
export function GoldenFluidWave({
  className = "",
  size = 400,
  opacity = 0.22,
}) {
  return (
    <svg
      aria-hidden="true"
      className={`decorative-watermark golden-fluid-wave ${className}`}
      width={size}
      height={size * 0.45}
      viewBox="0 0 500 220"
      fill="none"
      style={{ opacity, pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d7b875" stopOpacity="0.8" />
          <stop offset="35%" stopColor="#ebd49f" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#c6a15b" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#9f7a38" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="goldMeshGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c6a15b" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#ecd6a3" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#d7b875" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Faixa principal com volume acetinado */}
      <path
        d="M-20 180 C120 180 200 40 340 50 C420 55 460 120 520 100 L520 140 C440 160 400 90 320 80 C200 70 120 210 -20 210 Z"
        fill="url(#goldRibbonGrad)"
        fillOpacity="0.35"
      />

      {/* Linhas de contorno finas sobrepostas (efeito fita de seda) */}
      <path
        d="M-20 165 C130 165 210 25 350 35 C430 40 470 105 520 85"
        stroke="url(#goldRibbonGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M-20 180 C120 180 200 40 340 50 C420 55 460 120 520 100"
        stroke="#fff"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      <path
        d="M-20 195 C110 195 190 55 330 65 C410 70 450 135 520 115"
        stroke="url(#goldRibbonGrad)"
        strokeWidth="1.2"
      />
      <path
        d="M-20 210 C100 210 180 70 320 80 C400 85 440 150 520 130"
        stroke="url(#goldRibbonGrad)"
        strokeWidth="1.4"
      />
      <path
        d="M0 220 C110 215 170 95 300 95 C380 95 430 160 520 145"
        stroke="#d7b875"
        strokeWidth="0.8"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

// 4. Folhagem Tropical Dourada Esculpida (Inspirada na Imagem 6 - Luxo e Sofisticação)
export function GoldenTropicalLeaves({
  className = "",
  size = 200,
  opacity = 0.22,
}) {
  return (
    <svg
      aria-hidden="true"
      className={`decorative-watermark golden-tropical-leaves ${className}`}
      width={size}
      height={size * 1.1}
      viewBox="0 0 200 220"
      fill="none"
      style={{ opacity, pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="goldLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7e6be" />
          <stop offset="40%" stopColor="#d7b875" />
          <stop offset="80%" stopColor="#c6a15b" />
          <stop offset="100%" stopColor="#96712e" />
        </linearGradient>
      </defs>
      
      <g stroke="url(#goldLeafGrad)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Folha de Palmeira / Bananeira com nervuras ricas */}
        <path
          d="M190 20 C130 30 80 80 50 150 C70 155 120 140 160 100 C190 70 195 40 190 20 Z"
          fill="url(#goldLeafGrad)"
          fillOpacity="0.25"
        />
        {/* Nervura Central */}
        <path d="M190 20 C140 50 95 105 50 150" strokeWidth="2" />
        {/* Nervuras Secundárias estriadas */}
        <path d="M175 35 C155 45 135 48 115 45" />
        <path d="M160 50 C140 62 120 66 100 60" />
        <path d="M145 68 C125 80 105 84 85 78" />
        <path d="M128 88 C110 100 90 102 75 95" />
        <path d="M110 108 C95 120 78 122 65 115" />
        
        {/* Folha menor sobreposta no canto */}
        <path
          d="M130 130 C90 145 50 170 20 210 C40 212 80 200 110 170 C130 150 135 135 130 130 Z"
          fill="url(#goldLeafGrad)"
          fillOpacity="0.2"
        />
        <path d="M130 130 C95 155 60 185 20 210" strokeWidth="1.6" />
        <path d="M115 145 C100 155 85 158 70 155" />
        <path d="M100 162 C85 172 70 175 55 170" />
      </g>
    </svg>
  );
}

// 5. Ícones Arquitetônicos & Eco Real Estate (Inspirados na Imagem 8: Casa com Folha, Casa com Coração, Casa com Pin)
export function RealEstateEcoEmblem({
  className = "",
  size = 110,
  opacity = 0.24,
  variant = "eco-leaf", // "eco-leaf", "heart", "location", "modern-facade"
  color = "currentColor",
}) {
  return (
    <svg
      aria-hidden="true"
      className={`decorative-watermark real-estate-emblem ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      style={{ opacity, pointerEvents: "none" }}
    >
      <g stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {variant === "eco-leaf" && (
          <>
            {/* Casa com Folha Integrada (Ícone 1 da Imagem 8) */}
            <path d="M18 45 L50 18 L82 45 V84 H18 Z" fill={color} fillOpacity="0.06" />
            <path d="M70 34 V22 H80 V42" />
            {/* Folha Orgânica dentro da casa */}
            <path
              d="M50 40 C64 45 68 62 58 72 C48 80 38 72 40 58 C42 46 48 41 50 40 Z"
              fill={color}
              fillOpacity="0.22"
            />
            <path d="M50 42 C48 55 52 68 56 74" strokeWidth="1.4" />
            <path d="M50 56 C56 54 62 58 64 62" strokeWidth="1.2" />
          </>
        )}

        {variant === "heart" && (
          <>
            {/* Casa com Coração no Centro (Ícone de acolhimento e lar - Imagem 8) */}
            <path d="M16 48 L50 20 L84 48" strokeWidth="2.2" />
            <path d="M26 44 V82 H74 V44" />
            <path
              d="M50 68 C50 68 38 60 38 52 C38 46 43 43 47 46 C49 48 50 50 50 50 C50 50 51 48 53 46 C57 43 62 46 62 52 C62 60 50 68 50 68 Z"
              fill={color}
              fillOpacity="0.2"
            />
            <path d="M12 82 H88" strokeWidth="1.6" />
          </>
        )}

        {variant === "location" && (
          <>
            {/* Casa com Pin de Localização em Redenção (Imagem 8) */}
            <path d="M15 48 L50 18 L85 48" strokeWidth="2.2" />
            <path d="M24 45 V84 H76 V45" />
            <path
              d="M50 40 C43 40 38 45 38 52 C38 62 50 74 50 74 C50 74 62 62 62 52 C62 45 57 40 50 40 Z"
              fill={color}
              fillOpacity="0.2"
            />
            <circle cx="50" cy="52" r="3.5" fill={color} />
          </>
        )}

        {variant === "modern-facade" && (
          <>
            {/* Fachada Arquitetônica Contemporânea (Imagem 8) */}
            <path d="M15 50 L45 25 L75 50" strokeWidth="2" />
            <path d="M22 46 V84 H68 V46" />
            <path d="M68 55 H85 V84 H68" />
            <rect x="30" y="52" width="12" height="12" rx="1" fill={color} fillOpacity="0.15" />
            <rect x="48" y="52" width="12" height="12" rx="1" fill={color} fillOpacity="0.15" />
            <path d="M38 84 V70 H52 V84" />
          </>
        )}
      </g>
    </svg>
  );
}

// Mantendo compatibilidade com imports anteriores
export function SubtleLeafWatermark({ className = "", size = 120, opacity = 0.25, variant = "monstera", color = "currentColor" }) {
  if (variant === "laurel" || variant === "sprout") {
    return <FineBotanicalBranch className={className} size={size} opacity={opacity} color={color} variant="vertical" />;
  }
  return <FineBotanicalBranch className={className} size={size} opacity={opacity} color={color} variant="horizontal" />;
}

export function SubtleHouseWatermark({ className = "", size = 120, opacity = 0.25, color = "currentColor" }) {
  return <RealEstateEcoEmblem className={className} size={size} opacity={opacity} variant="eco-leaf" color={color} />;
}

export function SubtleBotanicalHouseEmblem({ className = "", size = 140, opacity = 0.25, color = "currentColor" }) {
  return <OrganicBotanicalAbstract className={className} size={size} opacity={opacity} variant="gold" />;
}
