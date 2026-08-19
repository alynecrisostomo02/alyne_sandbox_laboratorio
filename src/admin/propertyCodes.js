export function normalizePropertyCode(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? digits.padStart(3, "0") : "";
}

export function propertyCodeFromRecord(property) {
  return normalizePropertyCode(property?.idRef || property?.id);
}

export function suggestAvailablePropertyCodes(records, count = 4) {
  const used = new Set((records || []).map(propertyCodeFromRecord).filter(Boolean));
  const highest = [...used].reduce((max, code) => Math.max(max, Number(code)), 0);
  const suggestions = [];
  let candidate = highest + 1;

  while (suggestions.length < count) {
    const code = String(candidate).padStart(3, "0");
    if (!used.has(code)) suggestions.push(code);
    candidate += 1;
  }

  return suggestions;
}
