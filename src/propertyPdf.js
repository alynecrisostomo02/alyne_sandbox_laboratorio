import { jsPDF } from "jspdf";
import { currency } from "./utils";
import {
  propertyGallery,
  propertyPriceLabel,
  propertyPriceNoteLabel,
  propertyPublicLocation,
  propertyReference,
  propertyStatus,
} from "./propertyStatus";

const typeNames = {
  casa: "Casa",
  apartamento: "Apartamento",
  lote: "Lote",
  sala: "Sala comercial",
  "ponto-comercial": "Ponto comercial",
  condominio: "Imóvel em condomínio",
};

function formatDimension(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.filter(Boolean).join(" × ");
  return value.label || value.display || [value.width, value.depth].filter(Boolean).join(" × ");
}

function extractPublicItems(value) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  const labels = values.flatMap((item) => {
    if (typeof item === "string" || typeof item === "number") return String(item).trim();
    if (!item || typeof item !== "object") return [];
    const label = item.label || item.name || item.title;
    const detail = item.value ?? item.amount ?? item.description;
    if (label && detail !== undefined && detail !== null && detail !== "") {
      const formatted = typeof detail === "number" ? currency.format(detail) : String(detail);
      return `${label}: ${formatted}`;
    }
    return label ? String(label).trim() : [];
  });
  return [...new Set(labels.filter(Boolean))];
}

/**
 * Loads an image from URL and converts it to a data URL (JPEG/PNG).
 */
export async function loadImageAsDataUrl(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        resolve({ dataUrl, width: canvas.width, height: canvas.height });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    if (typeof window !== "undefined" && url.startsWith("/")) {
      img.src = `${window.location.origin}${url}`;
    } else {
      img.src = url;
    }
    // Timeout after 3s if image is slow
    setTimeout(() => resolve(null), 3000);
  });
}

/**
 * Generates and downloads a branded PDF dossier for a given catalog property.
 */
export async function downloadPropertyPdf(property, onProgress) {
  if (!property) return false;

  onProgress?.("Preparando dados do imóvel...");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Colors
  const GREEN_950 = [14, 42, 34];
  const GREEN_900 = [24, 63, 53];
  const GOLD = [200, 164, 95];
  const GOLD_LIGHT = [249, 246, 240];
  const TEXT_DARK = [30, 41, 35];
  const TEXT_MUTED = [100, 110, 105];
  const LINE_COLOR = [225, 220, 210];

  let currentY = 0;

  // Carrega logotipo oficial da Alyne
  onProgress?.("Carregando logotipo oficial...");
  let logoData = null;
  try {
    logoData = await loadImageAsDataUrl("/branding/logo-alyne-padrao.jpg");
  } catch {
    logoData = null;
  }

  // 1. Top Brand Header com Logo
  const headerHeight = 32;
  doc.setFillColor(...GREEN_950);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  // Gold accent bar
  doc.setFillColor(...GOLD);
  doc.rect(0, headerHeight, pageWidth, 1.5, "F");

  let textStartX = margin;

  // Desenha logotipo da Alyne no topo
  if (logoData?.dataUrl) {
    const logoSize = 23;
    const logoX = margin;
    const logoY = (headerHeight - logoSize) / 2;

    // Moldura elegante para o logo
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(logoX - 0.8, logoY - 0.8, logoSize + 1.6, logoSize + 1.6, 2.5, 2.5, "F");
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.roundedRect(logoX - 0.8, logoY - 0.8, logoSize + 1.6, logoSize + 1.6, 2.5, 2.5, "D");

    doc.addImage(logoData.dataUrl, "JPEG", logoX, logoY, logoSize, logoSize);
    textStartX = margin + logoSize + 5.5;
  }

  // Brand text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("ALYNE CRISÓSTOMO", textStartX, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text("CORRETORA DE IMÓVEIS • REDENÇÃO - PARÁ", textStartX, 18.5);

  doc.setFontSize(7);
  doc.setTextColor(200, 215, 210);
  doc.text("ATENDIMENTO EXCLUSIVO & CONSULTORIA IMOBILIÁRIA", textStartX, 23.5);

  // Reference and Status Pill on right side
  const ref = propertyReference(property) || property.id;
  const purpose = property.purpose === "venda" ? "VENDA" : "LOCAÇÃO";
  const status = propertyStatus(property);

  const pillWidth = 52;
  const pillHeight = 18;
  const pillX = pageWidth - margin - pillWidth;
  const pillY = (headerHeight - pillHeight) / 2;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pillX, pillY, pillWidth, pillHeight, 2, 2, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.roundedRect(pillX, pillY, pillWidth, pillHeight, 2, 2, "D");

  doc.setTextColor(...GREEN_950);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`REF: ${ref}`, pillX + pillWidth / 2, pillY + 6.5, { align: "center" });

  doc.setFontSize(7.5);
  doc.setTextColor(...GREEN_900);
  doc.text(`${purpose} • ${status.label.toUpperCase()}`, pillX + pillWidth / 2, pillY + 12.5, { align: "center" });

  currentY = headerHeight + 8;

  // 2. Title & Location
  doc.setTextColor(...GREEN_950);
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(property.title || "Imóvel em Redenção", contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 6.5;

  const location = propertyPublicLocation(property);
  const propertyType = property.typeLabel || typeNames[property.type] || property.type || "Imóvel";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Tipo: ${propertyType}   |   Localização: ${location || "Redenção - PA"}`, margin, currentY);
  currentY += 6;

  // 3. Price & Financial Box
  const priceLabel = propertyPriceLabel(property);
  const priceNote = propertyPriceNoteLabel(property);

  doc.setFillColor(...GOLD_LIGHT);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...GREEN_950);
  doc.text(priceLabel, margin + 6, currentY + 9);

  if (priceNote) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(priceNote, pageWidth - margin - 6, currentY + 9, { align: "right" });
  }

  currentY += 18;

  // 4. Image Section (Try loading main cover photo)
  onProgress?.("Processando foto principal do imóvel...");
  const gallery = propertyGallery(property);
  const mainImage = gallery[0];

  let imageLoaded = false;
  if (mainImage?.src) {
    try {
      const imgData = await loadImageAsDataUrl(mainImage.src);
      if (imgData?.dataUrl) {
        const imgMaxHeight = 65;
        const imgAspect = imgData.width / imgData.height;
        let finalWidth = contentWidth;
        let finalHeight = finalWidth / imgAspect;

        if (finalHeight > imgMaxHeight) {
          finalHeight = imgMaxHeight;
          finalWidth = finalHeight * imgAspect;
        }

        const imgX = margin + (contentWidth - finalWidth) / 2;

        // Image frame
        doc.setFillColor(245, 243, 238);
        doc.rect(imgX - 0.5, currentY - 0.5, finalWidth + 1, finalHeight + 1, "F");

        doc.addImage(imgData.dataUrl, "JPEG", imgX, currentY, finalWidth, finalHeight);

        // Subtle frame border
        doc.setDrawColor(...LINE_COLOR);
        doc.setLineWidth(0.3);
        doc.rect(imgX, currentY, finalWidth, finalHeight, "D");

        currentY += finalHeight + 6;
        imageLoaded = true;
      }
    } catch {
      imageLoaded = false;
    }
  }

  // 5. Key Facts / Specifications Grid
  const landDimensions = formatDimension(property.landDimensions);
  const rawFacts = [
    property.bedrooms > 0 && [`${property.bedrooms}`, "Quartos"],
    property.suites > 0 && [`${property.suites}`, "Suítes"],
    property.bathrooms > 0 && [`${property.bathrooms}`, "Banheiros"],
    property.parking > 0 && [`${property.parking}`, "Vagas Garagem"],
    property.builtArea > 0 && [`${property.builtArea} m²`, "Área Construída"],
    property.landArea > 0 && [`${property.landArea} m²`, "Área Terreno"],
    landDimensions && [`${landDimensions}`, "Dimensões"],
    typeof property.financeable === "boolean" && [property.financeable ? "Sim" : "Não", "Financiável"],
  ].filter(Boolean);

  if (rawFacts.length > 0) {
    const factCols = Math.min(rawFacts.length, 4);
    const factCardWidth = (contentWidth - (factCols - 1) * 3) / factCols;
    const cardHeight = 12;

    rawFacts.slice(0, 8).forEach((fact, i) => {
      const col = i % factCols;
      const row = Math.floor(i / factCols);
      const x = margin + col * (factCardWidth + 3);
      const y = currentY + row * (cardHeight + 3);

      doc.setFillColor(252, 251, 248);
      doc.setDrawColor(...LINE_COLOR);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, factCardWidth, cardHeight, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...GREEN_950);
      doc.text(String(fact[0]), x + factCardWidth / 2, y + 5.5, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(String(fact[1]), x + factCardWidth / 2, y + 9.5, { align: "center" });
    });

    const totalFactRows = Math.ceil(Math.min(rawFacts.length, 8) / factCols);
    currentY += totalFactRows * (cardHeight + 3) + 4;
  }

  // Helper for Section Headers
  const renderSectionHeader = (title) => {
    if (currentY > pageHeight - 35) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...GREEN_950);
    doc.text(title, margin, currentY);

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY + 1.5, margin + 25, currentY + 1.5);
    doc.setDrawColor(...LINE_COLOR);
    doc.setLineWidth(0.2);
    doc.line(margin + 25, currentY + 1.5, margin + contentWidth, currentY + 1.5);

    currentY += 6.5;
  };

  // 6. Description
  const description = property.description || property.fullDescription || property.shortDescription;
  if (description) {
    renderSectionHeader("SOBRE O IMÓVEL");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_DARK);

    const descLines = doc.splitTextToSize(description, contentWidth);
    doc.text(descLines, margin, currentY);
    currentY += descLines.length * 4.2 + 4;
  }

  // 7. Features & Amenities
  const features = extractPublicItems(property.features);
  const amenities = extractPublicItems(property.amenities);
  const combinedItems = [...new Set([...features, ...amenities])];

  if (combinedItems.length > 0) {
    renderSectionHeader("CARACTERÍSTICAS & COMODIDADES");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_DARK);

    const colWidth = (contentWidth - 6) / 2;
    const half = Math.ceil(combinedItems.length / 2);
    const col1 = combinedItems.slice(0, half);
    const col2 = combinedItems.slice(half);

    const startY = currentY;
    let maxColY = currentY;

    col1.forEach((item, idx) => {
      const y = startY + idx * 4.5;
      if (y > pageHeight - 25) return;
      doc.setTextColor(...GOLD);
      doc.text("●", margin, y);
      doc.setTextColor(...TEXT_DARK);
      doc.text(item, margin + 4, y);
      maxColY = Math.max(maxColY, y);
    });

    col2.forEach((item, idx) => {
      const y = startY + idx * 4.5;
      if (y > pageHeight - 25) return;
      doc.setTextColor(...GOLD);
      doc.text("●", margin + colWidth + 6, y);
      doc.setTextColor(...TEXT_DARK);
      doc.text(item, margin + colWidth + 10, y);
      maxColY = Math.max(maxColY, y);
    });

    currentY = maxColY + 6;
  }

  // 8. Documentation & Conditions
  const documents = extractPublicItems(property.documents);
  const conditions = extractPublicItems(property.conditions);
  const docConditions = [...new Set([...documents, ...conditions])];

  if (docConditions.length > 0 && currentY < pageHeight - 40) {
    renderSectionHeader("DOCUMENTAÇÃO & CONDIÇÕES COMERCIAIS");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_DARK);

    docConditions.forEach((item) => {
      if (currentY > pageHeight - 25) return;
      doc.setTextColor(...GREEN_900);
      doc.text("✓", margin, currentY);
      doc.setTextColor(...TEXT_DARK);
      doc.text(item, margin + 4, currentY);
      currentY += 4.5;
    });
    currentY += 3;
  }

  // 9. Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Footer divider line
    doc.setDrawColor(...LINE_COLOR);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    // Footer text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(...TEXT_MUTED);

    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR") + " às " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    doc.text(`Alyne Crisóstomo Imóveis • Redenção - PA • Documento gerado em ${dateStr}`, margin, pageHeight - 9);
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 9, { align: "right" });
  }

  // Download filename
  const cleanId = (property.id || ref || "imovel").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const filename = `Ficha-Imovel-${cleanId}-Alyne-Crisostomo.pdf`;

  onProgress?.("Concluindo download do PDF...");
  doc.save(filename);
  return true;
}

/**
 * Generates and downloads a branded PDF dossier for a property capture sheet (Ficha de Captação).
 * Includes Alyne's logo at the top header, structured tables, differentials and notes.
 */
export async function downloadCaptacaoPdf(form, differentials = [], onProgress) {
  if (!form) return false;

  onProgress?.("Preparando ficha de captação em PDF...");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Cores institucionais
  const GREEN_950 = [14, 42, 34];
  const GREEN_900 = [24, 63, 53];
  const GOLD = [200, 164, 95];
  const GOLD_LIGHT = [249, 246, 240];
  const TEXT_DARK = [30, 41, 35];
  const TEXT_MUTED = [100, 110, 105];
  const LINE_COLOR = [225, 220, 210];

  let currentY = 0;

  // Carrega logotipo oficial da Alyne
  onProgress?.("Carregando logotipo oficial...");
  let logoData = null;
  try {
    logoData = await loadImageAsDataUrl("/branding/logo-alyne-padrao.jpg");
  } catch {
    logoData = null;
  }

  // 1. Top Brand Header com Logotipo
  const headerHeight = 32;
  doc.setFillColor(...GREEN_950);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  // Faixa de destaque dourada
  doc.setFillColor(...GOLD);
  doc.rect(0, headerHeight, pageWidth, 1.5, "F");

  let textStartX = margin;

  // Desenha logotipo da Alyne no topo
  if (logoData?.dataUrl) {
    const logoSize = 23;
    const logoX = margin;
    const logoY = (headerHeight - logoSize) / 2;

    // Moldura elegante para o logo
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(logoX - 0.8, logoY - 0.8, logoSize + 1.6, logoSize + 1.6, 2.5, 2.5, "F");
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.roundedRect(logoX - 0.8, logoY - 0.8, logoSize + 1.6, logoSize + 1.6, 2.5, 2.5, "D");

    doc.addImage(logoData.dataUrl, "JPEG", logoX, logoY, logoSize, logoSize);
    textStartX = margin + logoSize + 5.5;
  }

  // Brand text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("ALYNE CRISÓSTOMO IMÓVEIS", textStartX, 12.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GOLD);
  doc.text("DOSSIÊ OFICIAL DE CAPTAÇÃO DE IMÓVEL", textStartX, 18);

  doc.setFontSize(7.2);
  doc.setTextColor(200, 215, 210);
  doc.text("SISTEMA ADMINISTRATIVO • REDENÇÃO - PARÁ", textStartX, 23.5);

  // Badge lateral direita
  const statusPillWidth = 52;
  const statusPillHeight = 18;
  const statusPillX = pageWidth - margin - statusPillWidth;
  const statusPillY = (headerHeight - statusPillHeight) / 2;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(statusPillX, statusPillY, statusPillWidth, statusPillHeight, 2, 2, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.roundedRect(statusPillX, statusPillY, statusPillWidth, statusPillHeight, 2, 2, "D");

  doc.setTextColor(...GREEN_950);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("FICHA DE CAPTAÇÃO", statusPillX + statusPillWidth / 2, statusPillY + 6.5, { align: "center" });

  doc.setFontSize(7.5);
  doc.setTextColor(...GREEN_900);
  doc.text(
    `${(form.purpose || "Venda").toUpperCase()} • ${(form.propertyType || "Imóvel").toUpperCase()}`,
    statusPillX + statusPillWidth / 2,
    statusPillY + 12.5,
    { align: "center" }
  );

  currentY = headerHeight + 8;

  // Helper para desenhar títulos de seções
  const renderSectionHeader = (title) => {
    if (currentY > pageHeight - 35) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...GREEN_950);
    doc.text(title, margin, currentY);

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY + 1.5, margin + 28, currentY + 1.5);
    doc.setDrawColor(...LINE_COLOR);
    doc.setLineWidth(0.2);
    doc.line(margin + 28, currentY + 1.5, margin + contentWidth, currentY + 1.5);

    currentY += 7;
  };

  // Helper para desenhar pares de chave-valor em grid
  const renderFieldGrid = (fields, cols = 2) => {
    const colWidth = (contentWidth - (cols - 1) * 4) / cols;
    const fieldHeight = 12.5;

    fields.forEach((field, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = margin + col * (colWidth + 4);
      const y = currentY + row * (fieldHeight + 2.5);

      if (y > pageHeight - 25) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFillColor(252, 251, 248);
      doc.setDrawColor(...LINE_COLOR);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, colWidth, fieldHeight, 1.5, 1.5, "FD");

      // Rótulo
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(field.label.toUpperCase(), x + 3.5, y + 4.5);

      // Valor
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...GREEN_950);
      const displayVal = String(field.value || "Não informado");
      const truncated = doc.splitTextToSize(displayVal, colWidth - 7)[0] || displayVal;
      doc.text(truncated, x + 3.5, y + 9.5);
    });

    const totalRows = Math.ceil(fields.length / cols);
    currentY += totalRows * (fieldHeight + 2.5) + 4;
  };

  // 1. Dados Principais & Proprietário
  renderSectionHeader("1. DADOS PRINCIPAIS & PROPRIETÁRIO");
  renderFieldGrid([
    { label: "Tipo do Imóvel", value: form.propertyType },
    { label: "Finalidade Pretendida", value: form.purpose },
    { label: "Proprietário(a)", value: form.owner },
    { label: "Telefone / WhatsApp", value: form.phone },
  ], 2);

  // 2. Localização do Imóvel
  renderSectionHeader("2. LOCALIZAÇÃO DO IMÓVEL");
  renderFieldGrid([
    { label: "Bairro", value: form.neighborhood },
    { label: "Condomínio / Edifício", value: form.condominium },
    { label: "Endereço Completo / Quadra & Lote", value: form.address },
    { label: "Cidade / UF", value: "Redenção - PA" },
  ], 2);

  // 3. Cômodos & Metragens
  renderSectionHeader("3. ESTRUTURA & METRAGENS");
  renderFieldGrid([
    { label: "Quartos", value: form.bedrooms ? `${form.bedrooms} dormitório(s)` : "Não informado" },
    { label: "Suítes", value: form.suites ? `${form.suites} suíte(s)` : "Não informado" },
    { label: "Banheiros", value: form.bathrooms ? `${form.bathrooms} banheiro(s)` : "Não informado" },
    { label: "Vagas de Garagem", value: form.parkingSpaces ? `${form.parkingSpaces} vaga(s)` : "Não informado" },
    { label: "Área Construída", value: form.builtArea ? `${form.builtArea} m²` : "Não informada" },
    { label: "Área do Terreno", value: form.landArea ? `${form.landArea} m²` : "Não informada" },
  ], 3);

  // 4. Diferenciais Detectados
  const diffList = Array.isArray(differentials) && differentials.length > 0 ? differentials : [];
  if (diffList.length > 0) {
    renderSectionHeader("4. DIFERENCIAIS & ITENS EXTRAS");
    const diffWidth = (contentWidth - 6) / 3;
    const startY = currentY;
    let maxDiffY = currentY;

    diffList.forEach((item, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = margin + col * (diffWidth + 3);
      const y = startY + row * 6;

      doc.setTextColor(...GOLD);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("●", x, y + 3.5);

      doc.setTextColor(...TEXT_DARK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(String(item), x + 4, y + 3.5);

      maxDiffY = Math.max(maxDiffY, y + 6);
    });

    currentY = maxDiffY + 4;
  }

  // 5. Observações & Negociação
  if (form.notes) {
    renderSectionHeader("5. OBSERVAÇÕES & NEGOCIAÇÃO");
    doc.setFillColor(...GOLD_LIGHT);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);

    const noteLines = doc.splitTextToSize(form.notes, contentWidth - 8);
    const boxHeight = Math.max(14, noteLines.length * 4.2 + 8);

    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_DARK);
    doc.text(noteLines, margin + 4, currentY + 6);

    currentY += boxHeight + 6;
  }

  // 6. Rodapé em todas as páginas
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    doc.setDrawColor(...LINE_COLOR);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(...TEXT_MUTED);

    const now = new Date();
    const dateStr =
      now.toLocaleDateString("pt-BR") + " às " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    doc.text(`Alyne Crisóstomo Imóveis • Redenção - PA • Dossiê de Captação gerado em ${dateStr}`, margin, pageHeight - 9);
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 9, { align: "right" });
  }

  // Nome do arquivo para download
  const cleanOwner = (form.owner || form.propertyType || "captacao").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const filename = `Ficha-Captacao-${cleanOwner}-Alyne-Crisostomo.pdf`;

  onProgress?.("Concluindo download do PDF...");
  doc.save(filename);
  return true;
}
