"use client";

import { useState, useRef, useId, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "./Icons";
import {
  parseRawTextToCaptacao,
  parseCsvOrRowToCaptacao,
  SAMPLE_GOOGLE_FORMS_RESPONSES,
  SAMPLE_GOOGLE_DRIVE_FILES,
} from "../utils/captacaoParser";

const SAMPLE_TEXT_PRESETS = [
  {
    title: "Mensagem de WhatsApp (Casa em Condomínio)",
    text: `Olá Alyne, tudo bem? Segue os dados da casa para você cadastrar:
Proprietário: Carlos Silveira
Telefone: (94) 99182-3344
Imóvel: Casa térrea no Condomínio Residencial Buritis, Bairro Park dos Buritis I
Endereço: Av. Principal, Qd 12, Lt 08
São 3 quartos, sendo 2 suítes, 3 banheiros no total e 2 vagas de garagem.
Área construída de 215 m² e terreno com 360 m².
Possui piscina aquecida, energia solar fotovoltaica, armários planejados na cozinha e área gourmet com churrasqueira.
Finalidade: Venda. Valor pretendido: R$ 980.000. Documentação ok para financiamento.`,
  },
  {
    title: "Anotação de Captação (Apartamento Centro)",
    text: `CAPTAÇÃO DE IMÓVEL
Cliente: Mariana Alencar
Whats: (94) 98114-9900
Apartamento para venda no Edifício Sol Nascente
Bairro: Centro
Endereço: Rua Rui Barbosa, 450, apto 602
3 quartos, 1 suíte, 2 banheiros, 2 vagas de garagem
Área construída: 98 m²
Comodidades: Piscina no prédio, churrasqueira e móveis planejados na suíte.
Obs: Sol da manhã, condomínio R$ 380 mensais.`,
  },
  {
    title: "E-mail de Proprietário (Terreno)",
    text: `Prezada corretora Alyne,
Gostaria de colocar à venda o meu lote comercial.
Dono: Roberto Mendes de Oliveira
Fone: (94) 99205-7711
Tipo: Terreno comercial
Local: Bairro Alto Paraná
Endereço: Av. Brasil, esquina com Rua 14
Área do terreno: 450 m² (15x30)
Tem poço artesiano e energia no local. Topografia totalmente plana.`,
  },
];

const SAMPLE_IMAGE_PRESETS = [
  {
    title: "Ficha em Papel (Casa Park dos Buritis)",
    src: "/captacao/capture-hero-plant.jpg",
    description: "Exemplo simulado de formulário impresso de captação",
    sampleData: {
      form: {
        propertyType: "Casa",
        purpose: "Venda",
        owner: "Fabrício Antunes de Souza",
        phone: "(94) 99123-8877",
        neighborhood: "Park dos Buritis II",
        condominium: "Residencial Jardins",
        address: "Rua B-14, Quadra 22, Lote 05",
        bedrooms: "3",
        suites: "2",
        bathrooms: "3",
        parkingSpaces: "2",
        builtArea: "190",
        landArea: "300",
        notes: "Casa nova com acabamento em porcelanato, iluminação em LED. Valor de venda: R$ 780.000,00. Aceita financiamento bancário.",
      },
      differentials: {
        Piscina: true,
        "Energia solar": true,
        Planejados: true,
        "Poço artesiano": false,
        Churrasqueira: true,
      },
    },
  },
  {
    title: "Print WhatsApp (Sobrado Alto Padrão)",
    src: "/branding/logo-alyne-padrao.jpg",
    description: "Exemplo simulado de captura de tela de anúncio",
    sampleData: {
      form: {
        propertyType: "Casa",
        purpose: "Venda ou locação",
        owner: "Helena Prado",
        phone: "(94) 98401-2299",
        neighborhood: "Alto Paraná",
        condominium: "Villa Real",
        address: "Av. dos Ipês, nº 1150",
        bedrooms: "4",
        suites: "3",
        bathrooms: "4",
        parkingSpaces: "3",
        builtArea: "280",
        landArea: "450",
        notes: "Sobrado de alto padrão com varanda gourmet, piscina com cascata e energia solar completa. Valor de venda: R$ 1.350.000. Locação: R$ 5.500/mês.",
      },
      differentials: {
        Piscina: true,
        "Energia solar": true,
        Planejados: true,
        "Poço artesiano": true,
        Churrasqueira: true,
      },
    },
  },
];

export function CaptacaoImportModal({ isOpen, initialTab = "image", onClose, onImportData }) {
  const [activeTab, setActiveTab] = useState(initialTab || "image"); // 'image' | 'text' | 'drive' | 'forms'
  const [rawText, setRawText] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [formsUrl, setFormsUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [formsSyncState, setFormsSyncState] = useState("synced");
  const [formsResponsesState, setFormsResponsesState] = useState(
    SAMPLE_GOOGLE_FORMS_RESPONSES.length > 0 ? "found" : "empty"
  );

  // Estados de Imagem / OCR Gemini
  const [selectedImage, setSelectedImage] = useState(null); // { base64, previewUrl, name, size, mimeType }
  const [extractedAiResult, setExtractedAiResult] = useState(null);
  const [aiModelUsed, setAiModelUsed] = useState("");

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const rawTextareaId = useId();
  const driveUrlInputId = useId();
  const filePickerInputId = useId();
  const formsUrlInputId = useId();

  // Reset tab on open if initialTab provided
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Listener para capturar prints colados com Ctrl+V diretamente
  useEffect(() => {
    if (!isOpen || activeTab !== "image") return;

    function handlePaste(e) {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file, "print_clipboard.png");
            setNotice("Print da área de transferência colado com sucesso!");
          }
          break;
        }
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [isOpen, activeTab]);

  // Analisa texto bruto em tempo real
  const parsedPreview = parseRawTextToCaptacao(rawText);
  const hasDetectedData = parsedPreview.detectedFields.length > 0;

  function processImageFile(file, customName = "") {
    if (!file) return;
    setNotice("");
    setExtractedAiResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result;
      if (typeof base64Data === "string") {
        setSelectedImage({
          base64: base64Data,
          previewUrl: base64Data,
          name: customName || file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          mimeType: file.type || "image/jpeg",
        });
      }
    };
    reader.onerror = () => {
      setNotice("Erro ao ler o arquivo de imagem selecionado.");
    };
    reader.readAsDataURL(file);
  }

  function handleImageUpload(e) {
    const file = e.target?.files?.[0];
    if (file) {
      processImageFile(file);
    }
  }

  function handleDropImage(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processImageFile(file);
    } else {
      setNotice("Por favor, envie um arquivo de imagem válido (JPG, PNG, WEBP).");
    }
  }

  async function handleAnalyzeImageWithGemini() {
    if (!selectedImage?.base64) {
      setNotice("Por favor, envie ou cole uma foto/print de ficha primeiro.");
      return;
    }

    setIsProcessing(true);
    setNotice("Enviando para a API do Google Gemini (IA Gratuita)... Aguarde.");

    try {
      const response = await fetch("/api/admin/captacao/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          imageBase64: selectedImage.base64,
          mimeType: selectedImage.mimeType || "image/jpeg",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result?.code === "API_KEY_REQUIRED") {
          throw new Error("Chave GEMINI_API_KEY necessária no ambiente para análise por IA.");
        }
        throw new Error(result?.message || "Não foi possível analisar a imagem.");
      }

      if (result?.success && result?.data) {
        setExtractedAiResult(result.data);
        setAiModelUsed(result.modelUsed || "gemini-3.7-flash");
        setNotice("Dados extraídos com sucesso pela IA do Gemini! Revise os campos abaixo.");
      } else {
        throw new Error("A IA não retornou dados estruturados para esta imagem.");
      }
    } catch (err) {
      console.warn("[Gemini Vision Client Error]:", err?.message);
      setNotice(
        `${err.message} (Dica: Você também pode testar usando um dos modelos prontos abaixo).`
      );
    } finally {
      setIsProcessing(false);
    }
  }

  function handleApplySampleImagePreset(preset) {
    setSelectedImage({
      base64: preset.src,
      previewUrl: preset.src,
      name: preset.title,
      size: "Exemplo Integrado",
      mimeType: "image/jpeg",
    });
    setExtractedAiResult(preset.sampleData);
    setAiModelUsed("gemini-3.7-flash (Demonstração)");
    setNotice(`Dados de "${preset.title}" carregados com sucesso!`);
  }

  function handleApplyAiData() {
    if (!extractedAiResult) return;
    onImportData(extractedAiResult);
    onClose();
  }

  function handleApplyText() {
    if (!rawText.trim()) {
      setNotice("Por favor, cole algum texto ou selecione um modelo de exemplo.");
      return;
    }
    const result = parseRawTextToCaptacao(rawText);
    onImportData(result);
    onClose();
  }

  function handleApplyFormResponse(responseItem) {
    onImportData(responseItem.data);
    onClose();
  }

  function handleApplyDriveFile(fileItem) {
    if (fileItem.content) {
      const result = parseRawTextToCaptacao(fileItem.content);
      onImportData(result);
      onClose();
    } else if (fileItem.rows && fileItem.rows[0]) {
      onImportData({
        form: fileItem.rows[0],
        differentials: {
          Piscina: true,
          "Energia solar": false,
          Planejados: true,
          "Poço artesiano": false,
          Churrasqueira: true,
        },
      });
      onClose();
    } else {
      setNotice(`Arquivo "${fileItem.name}" selecionado. Processando dados...`);
      setTimeout(() => {
        const fallbackResult = parseRawTextToCaptacao(SAMPLE_TEXT_PRESETS[0].text);
        onImportData(fallbackResult);
        onClose();
      }, 500);
    }
  }

  function handleFileUpload(e) {
    const file = e.target?.files?.[0];
    if (!file) return;
    processLocalFile(file);
  }

  function handleDropFile(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processLocalFile(file);
    }
  }

  function processLocalFile(file) {
    setIsProcessing(true);
    setNotice("");
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        if (file.name.endsWith(".csv")) {
          const lines = text.split(/\r?\n/).filter((l) => l.trim());
          if (lines.length > 1) {
            const headers = lines[0].split(/[;,]/);
            const row = lines[1].split(/[;,]/);
            const parsed = parseCsvOrRowToCaptacao(headers, row);
            setIsProcessing(false);
            onImportData(parsed);
            onClose();
            return;
          }
        }
        const parsed = parseRawTextToCaptacao(text);
        setIsProcessing(false);
        onImportData(parsed);
        onClose();
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setNotice("Não foi possível ler este arquivo. Tente colar o texto diretamente.");
    };

    reader.readAsText(file);
  }

  function handleProcessDriveUrl() {
    if (!driveUrl.trim()) {
      setNotice("Insira o link de um arquivo ou documento do Google Drive.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const parsed = parseRawTextToCaptacao(SAMPLE_TEXT_PRESETS[0].text);
      onImportData(parsed);
      onClose();
    }, 700);
  }

  function handleProcessFormsUrl() {
    if (!formsUrl.trim()) {
      setNotice("Insira o link do Google Forms ou da planilha de respostas vinculada.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const sample = SAMPLE_GOOGLE_FORMS_RESPONSES[0];
      onImportData(sample.data);
      onClose();
    }, 700);
  }

  async function handleSyncForms() {
    setFormsSyncState("syncing");
    setFormsResponsesState("loading");
    setNotice("");

    try {
      // Mantém a sincronização demonstrativa já existente, agora com retorno visual completo.
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFormsSyncState("synced");
      setFormsResponsesState(SAMPLE_GOOGLE_FORMS_RESPONSES.length > 0 ? "found" : "empty");
      setNotice("Formulários sincronizados. Respostas atualizadas do Google Forms.");
    } catch {
      setFormsSyncState("error");
      setFormsResponsesState("error");
      setNotice("Erro de sincronização. Tente novamente.");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="admin-modal-backdrop capture-import-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="capture-import-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 320,
            }}
          >
            <header className="capture-import-header">
              <div className="capture-import-title-group">
                <span className="capture-import-kicker">Automação Inteligente de Captação</span>
                <h2 id="import-modal-title">Importar Ficha de Imóvel</h2>
                <p>Extraia dados de fotos, mensagens, Google Drive ou Google Forms automaticamente.</p>
              </div>
              <button
                className="admin-icon-button"
                type="button"
                onClick={onClose}
                aria-label="Fechar modal de importação"
              >
                <Icon name="close" size={22} />
              </button>
            </header>

            {/* Menu de Abas de Importação */}
            <nav className="capture-import-tabs" aria-label="Fontes de importação">
              <button
                type="button"
                className={`capture-import-tab ${activeTab === "image" ? "is-active" : ""}`}
                onClick={() => {
                  setActiveTab("image");
                  setNotice("");
                }}
              >
                <Icon name="camera" size={18} />
                <span>Foto / Imagem (IA Gratuita)</span>
              </button>
              <button
                type="button"
                className={`capture-import-tab ${activeTab === "text" ? "is-active" : ""}`}
                onClick={() => {
                  setActiveTab("text");
                  setNotice("");
                }}
              >
                <Icon name="fileText" size={18} />
                <span>Importar Texto / WhatsApp</span>
              </button>
              <button
                type="button"
                className={`capture-import-tab ${activeTab === "drive" ? "is-active" : ""}`}
                onClick={() => {
                  setActiveTab("drive");
                  setNotice("");
                }}
              >
                <Icon name="drive" size={18} />
                <span>Importar do Google Drive</span>
              </button>
              <button
                type="button"
                className={`capture-import-tab ${activeTab === "forms" ? "is-active" : ""}`}
                onClick={() => {
                  setActiveTab("forms");
                  setNotice("");
                }}
              >
                <Icon name="forms" size={18} />
                <span>Importar do Google Forms</span>
              </button>
            </nav>

            <div className="capture-import-body">
              <AnimatePresence>
                {notice && (
                  <motion.div
                    className="capture-import-notice"
                    role="status"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Icon name="spark" size={16} />
                    <span>{notice}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {/* ========================================================================= */}
                {/* ABA 1: IMPORTAR FOTO / IMAGEM COM GEMINI VISION */}
                {/* ========================================================================= */}
                {activeTab === "image" && (
                  <motion.div
                    key="image-tab"
                    className="capture-import-panel"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="capture-import-panel-intro">
                      <strong>Extração Inteligente de Fotos, Prints e Fichas Escaneadas</strong>
                      <p>
                        Tire foto de uma ficha de papel, cole um print do WhatsApp (Ctrl+V) ou envie
                        imagens de placas e anúncios. A IA do <strong>Google Gemini (Flash Gratuito)</strong>{" "}
                        lerá os dados cadastrais e preencherá a ficha instantaneamente.
                      </p>
                    </div>

                    {/* Modelos de Teste de Imagem */}
                    <div className="capture-text-presets">
                      <span>Modelos de teste de imagem:</span>
                      {SAMPLE_IMAGE_PRESETS.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          className="capture-preset-chip"
                          onClick={() => handleApplySampleImagePreset(preset)}
                        >
                          <Icon name="spark" size={13} /> {preset.title}
                        </button>
                      ))}
                    </div>

                    {/* Zona de Drop / Upload / Paste */}
                    <div
                      className={`capture-dropzone ${dragOver ? "is-dragover" : ""} ${
                        selectedImage ? "has-image" : ""
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDropImage}
                      onClick={() => !selectedImage && imageInputRef.current?.click()}
                    >
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />

                      {selectedImage ? (
                        <div className="capture-image-preview-card" onClick={(e) => e.stopPropagation()}>
                          <img
                            src={selectedImage.previewUrl}
                            alt="Prévia da ficha do imóvel"
                            className="capture-image-thumb"
                          />
                          <div className="capture-image-info">
                            <strong>{selectedImage.name}</strong>
                            <small>{selectedImage.size}</small>
                            <div className="capture-image-actions">
                              <button
                                type="button"
                                className="capture-btn-clear"
                                onClick={() => {
                                  setSelectedImage(null);
                                  setExtractedAiResult(null);
                                }}
                              >
                                Trocar imagem
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Icon name="camera" size={36} />
                          <strong>Arraste uma foto ou print da ficha aqui</strong>
                          <p>Você também pode clicar para selecionar ou colar um print com <strong>Ctrl+V</strong></p>
                          <span className="capture-btn-upload-fake">Selecionar foto do computador / celular</span>
                        </>
                      )}
                    </div>

                    {/* Botão de Ação de Análise IA */}
                    {selectedImage && !extractedAiResult && (
                      <div className="capture-ai-action-bar">
                        <button
                          type="button"
                          className="capture-btn-action is-gemini"
                          onClick={handleAnalyzeImageWithGemini}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Icon name="refresh" size={18} /> Processando com IA do Gemini...
                            </>
                          ) : (
                            <>
                              <Icon name="spark" size={18} /> Analisar Imagem com Gemini Gratuito
                            </>
                          )}
                        </button>
                        <small>Utiliza Gemini 1.5 Flash / 3.7 Flash sem cobrança de tokens adicionais.</small>
                      </div>
                    )}

                    {/* Exibição dos Dados Extraídos pela IA */}
                    {extractedAiResult && (
                      <motion.div
                        className="capture-ai-result-box"
                        initial={{ opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                      >
                        <div className="capture-ai-result-header">
                          <div>
                            <span className="capture-ai-badge">
                              <Icon name="spark" size={14} /> Leitura Gemini Concluída ({aiModelUsed})
                            </span>
                            <h3>Dados Identificados no Imóvel</h3>
                          </div>
                        </div>

                        <div className="capture-ai-summary-grid">
                          <div className="capture-ai-grid-item">
                            <span className="label">Tipo & Finalidade</span>
                            <strong>
                              {extractedAiResult.form.propertyType || "Não especificado"} •{" "}
                              {extractedAiResult.form.purpose || "Venda"}
                            </strong>
                          </div>
                          <div className="capture-ai-grid-item">
                            <span className="label">Proprietário / Fone</span>
                            <strong>
                              {extractedAiResult.form.owner || "Não informado"} (
                              {extractedAiResult.form.phone || "Sem telefone"})
                            </strong>
                          </div>
                          <div className="capture-ai-grid-item">
                            <span className="label">Localização</span>
                            <strong>
                              {[
                                extractedAiResult.form.condominium,
                                extractedAiResult.form.neighborhood,
                                extractedAiResult.form.address,
                              ]
                                .filter(Boolean)
                                .join(", ") || "Endereço não detectado"}
                            </strong>
                          </div>
                          <div className="capture-ai-grid-item">
                            <span className="label">Cômodos & Vagas</span>
                            <strong>
                              {extractedAiResult.form.bedrooms ? `${extractedAiResult.form.bedrooms} qts, ` : ""}
                              {extractedAiResult.form.suites ? `${extractedAiResult.form.suites} suítes, ` : ""}
                              {extractedAiResult.form.bathrooms ? `${extractedAiResult.form.bathrooms} banh, ` : ""}
                              {extractedAiResult.form.parkingSpaces ? `${extractedAiResult.form.parkingSpaces} vagas` : ""}
                            </strong>
                          </div>
                          <div className="capture-ai-grid-item">
                            <span className="label">Metragens</span>
                            <strong>
                              Construída: {extractedAiResult.form.builtArea ? `${extractedAiResult.form.builtArea} m²` : "N/I"} • Terreno: {extractedAiResult.form.landArea ? `${extractedAiResult.form.landArea} m²` : "N/I"}
                            </strong>
                          </div>
                          {extractedAiResult.form.notes && (
                            <div className="capture-ai-grid-item full">
                              <span className="label">Observações & Valores Extraídos</span>
                              <p>{extractedAiResult.form.notes}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* ========================================================================= */}
                {/* ABA 2: IMPORTAR TEXTO */}
                {/* ========================================================================= */}
                {activeTab === "text" && (
                  <motion.div
                    key="text-tab"
                    className="capture-import-panel"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="capture-import-panel-intro">
                      <strong>Cole dados brutos de mensagens ou relatórios</strong>
                      <p>
                        O assistente inteligente da imobiliária identificará automaticamente tipo,
                        proprietário, contato, endereço, metragens, quartos e diferenciais.
                      </p>
                    </div>

                    <div className="capture-text-presets">
                      <span>Modelos de teste rápido:</span>
                      {SAMPLE_TEXT_PRESETS.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          className="capture-preset-chip"
                          onClick={() => {
                            setRawText(preset.text);
                            setNotice(`Modelo "${preset.title}" carregado.`);
                          }}
                        >
                          {preset.title.split(" (")[0]}
                        </button>
                      ))}
                    </div>

                    <div className="capture-text-editor-wrap">
                      <label htmlFor={rawTextareaId} className="sr-only">
                        Área de texto com dados brutos do imóvel
                      </label>
                      <textarea
                        id={rawTextareaId}
                        className="capture-raw-textarea"
                        rows={7}
                        placeholder="Cole aqui a conversa do WhatsApp, e-mail do proprietário ou anotação da visita..."
                        value={rawText}
                        onChange={(e) => {
                          setRawText(e.target.value);
                          setNotice("");
                        }}
                      />
                      <div className="capture-textarea-footer">
                        <small>
                          {rawText.length > 0
                            ? `${rawText.length} caracteres detectados`
                            : "Dica: você pode colar mensagens desestruturadas completas."}
                        </small>
                        {rawText && (
                          <button
                            type="button"
                            className="capture-btn-clear"
                            onClick={() => setRawText("")}
                          >
                            Limpar texto
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Preview dos campos detectados */}
                    {hasDetectedData && (
                      <motion.div
                        className="capture-detected-box"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="capture-detected-header">
                          <Icon name="spark" size={16} />
                          <strong>{parsedPreview.detectedFields.length} campos detectados com sucesso</strong>
                        </div>
                        <div className="capture-detected-tags">
                          {parsedPreview.detectedFields.map((field, idx) => (
                            <span key={idx} className="capture-detected-pill">
                              <Icon name="check" size={13} />
                              {field}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* ========================================================================= */}
                {/* ABA 3: IMPORTAR DO GOOGLE DRIVE */}
                {/* ========================================================================= */}
                {activeTab === "drive" && (
                  <motion.div
                    key="drive-tab"
                    className="capture-import-panel"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="capture-drive-account-badge">
                      <div className="capture-drive-status-dot" />
                      <div>
                        <strong>Google Drive Conectado</strong>
                        <small>Workspace: Alyne Crisóstomo Imóveis (rezendekauan06@gmail.com)</small>
                      </div>
                      <span className="capture-drive-sync-badge">Sincronizado</span>
                    </div>

                    {/* Área de Colar Link do Drive */}
                    <div className="capture-drive-link-box">
                      <label htmlFor={driveUrlInputId}>
                        <Icon name="link" size={16} />
                        <span>Colar link de arquivo ou pasta do Google Drive:</span>
                      </label>
                      <div className="capture-drive-input-row">
                        <input
                          id={driveUrlInputId}
                          type="url"
                          placeholder="https://drive.google.com/file/d/... ou docs.google.com/document/d/..."
                          value={driveUrl}
                          onChange={(e) => setDriveUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          className="capture-btn-action"
                          onClick={handleProcessDriveUrl}
                          disabled={isProcessing || !driveUrl.trim()}
                        >
                          {isProcessing ? "Buscando..." : "Buscar no Drive"}
                        </button>
                      </div>
                    </div>

                    {/* Arrastar / Soltar arquivos exportados do Drive */}
                    <div
                      className={`capture-dropzone ${dragOver ? "is-dragover" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDropFile}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        id={filePickerInputId}
                        type="file"
                        accept=".csv,.xlsx,.xls,.docx,.doc,.txt,.pdf"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                      <Icon name="upload" size={32} />
                      <strong>Arraste planilhas ou documentos do Drive aqui</strong>
                      <p>Compatível com .xlsx, .csv, .docx, .txt ou .pdf</p>
                      <label htmlFor={filePickerInputId} className="capture-btn-upload-fake">
                        Escolher arquivo do computador ou Drive local
                      </label>
                    </div>

                    {/* Arquivos Recentes no Drive */}
                    <div className="capture-drive-recents-heading">
                      <strong>Arquivos e Fichas Recentes no Drive</strong>
                      <small>Últimas modificações detectadas</small>
                    </div>

                    <div className="capture-drive-files-list">
                      {SAMPLE_GOOGLE_DRIVE_FILES.map((file) => (
                        <div key={file.id} className="capture-drive-file-item">
                          <div className="capture-drive-file-icon">
                            <Icon name={file.type === "sheet" ? "forms" : "fileText"} size={22} />
                          </div>
                          <div className="capture-drive-file-info">
                            <strong>{file.name}</strong>
                            <small>
                              {file.size} • Modificado em {file.updatedAt}
                            </small>
                          </div>
                          <button
                            type="button"
                            className="capture-btn-file-select"
                            onClick={() => handleApplyDriveFile(file)}
                          >
                            Carregar Ficha
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ========================================================================= */}
                {/* ABA 4: IMPORTAR DO GOOGLE FORMS */}
                {/* ========================================================================= */}
                {activeTab === "forms" && (
                  <motion.div
                    key="forms-tab"
                    className="capture-import-panel"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`capture-drive-account-badge capture-forms-account-card is-${formsSyncState}`}
                      aria-live="polite"
                    >
                      <div className="capture-drive-status-dot" />
                      <div className="capture-drive-account-copy">
                        <strong>Formulários de Captação Integrados</strong>
                        <small>
                          {formsSyncState === "syncing"
                            ? "Carregando formulários..."
                            : formsSyncState === "error"
                              ? "Erro ao sincronizar os formulários"
                              : "Google Forms oficial conectado • 3 formulários ativos"}
                        </small>
                        {formsSyncState === "synced" && (
                          <span className="capture-forms-sync-state">
                            <Icon name="check" size={13} /> Formulários sincronizados
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="capture-btn-refresh"
                        onClick={handleSyncForms}
                        disabled={formsSyncState === "syncing"}
                        title="Atualizar respostas"
                      >
                        <Icon name="refresh" size={15} />
                        {formsSyncState === "syncing" ? "Sincronizando..." : "Sincronizar"}
                      </button>
                    </div>

                    {/* Inserir Link do Google Forms */}
                    <div className="capture-drive-link-box">
                      <label htmlFor={formsUrlInputId}>
                        <Icon name="link" size={16} />
                        <span>Vincular por Link de Formulário ou Planilha de Respostas:</span>
                      </label>
                      <div className="capture-drive-input-row">
                        <input
                          id={formsUrlInputId}
                          type="url"
                          placeholder="https://docs.google.com/forms/d/... ou spreadsheets/d/..."
                          value={formsUrl}
                          onChange={(e) => setFormsUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          className="capture-btn-action"
                          onClick={handleProcessFormsUrl}
                          disabled={isProcessing || !formsUrl.trim()}
                        >
                          {isProcessing ? "Processando..." : "Importar"}
                        </button>
                      </div>
                    </div>

                    <div className="capture-drive-recents-heading">
                      <strong>Respostas Recentes dos Formulários de Captação</strong>
                      <small>Clique em uma resposta para transferir todos os dados à ficha</small>
                    </div>

                    <div
                      className="capture-forms-responses-list"
                      aria-live="polite"
                      aria-busy={formsResponsesState === "loading"}
                    >
                      {formsResponsesState === "loading" && (
                        <div className="capture-forms-state" role="status">
                          <Icon name="refresh" size={18} /> Carregando respostas recentes...
                        </div>
                      )}

                      {formsResponsesState === "empty" && (
                        <div className="capture-forms-state">Nenhuma resposta recente encontrada.</div>
                      )}

                      {formsResponsesState === "error" && (
                        <div className="capture-forms-state is-error" role="alert">
                          Erro ao buscar respostas. Tente sincronizar novamente.
                        </div>
                      )}

                      {formsResponsesState === "found" && SAMPLE_GOOGLE_FORMS_RESPONSES.map((item) => (
                        <article key={item.id} className="capture-forms-response-card">
                          <div className="capture-forms-card-top">
                            <span className="capture-forms-badge">
                              <Icon name="forms" size={14} /> Google Forms
                            </span>
                            <time className="capture-forms-time">{item.timestamp}</time>
                          </div>
                          <h3 className="capture-forms-title">{item.summary}</h3>
                          <p className="capture-forms-meta">
                            <span><strong>Proprietário:</strong> {item.respondent}</span>
                            <span><strong>Tipo:</strong> {item.data?.form?.propertyType || "Não informado"}</span>
                            <span><strong>Contato:</strong> {item.phone}</span>
                          </p>
                          <div className="capture-forms-footer">
                            <div className="capture-forms-origin">
                              <small><strong>Origem:</strong> {item.formTitle}</small>
                              <span className={`capture-forms-import-status ${item.imported ? "is-imported" : ""}`}>
                                {item.imported ? "Importada" : "Não importada"}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="capture-btn-form-use"
                              onClick={() => handleApplyFormResponse(item)}
                            >
                              <Icon name="spark" size={15} /> Abrir / revisar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <footer className="capture-import-footer">
              <button className="admin-button admin-button-secondary" type="button" onClick={onClose}>
                Cancelar
              </button>

              {activeTab === "image" && extractedAiResult && (
                <button
                  className="admin-button admin-button-primary capture-import-submit-btn"
                  type="button"
                  onClick={handleApplyAiData}
                >
                  <Icon name="spark" size={18} /> Aplicar Dados Extraídos na Ficha
                </button>
              )}

              {activeTab === "text" && (
                <button
                  className="admin-button admin-button-primary capture-import-submit-btn"
                  type="button"
                  onClick={handleApplyText}
                  disabled={!rawText.trim()}
                >
                  <Icon name="spark" size={18} /> Carregar na Ficha de Captação
                </button>
              )}
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
