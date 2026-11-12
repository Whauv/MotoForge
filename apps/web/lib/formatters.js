const priceFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatPrice(amount) {
  return `₹${priceFormatter.format(Math.round(Number(amount || 0)))}`;
}

export function formatWeight(kg) {
  return `${Number(kg || 0).toFixed(1)} kg`;
}

export function formatHP(hp) {
  return `${Number(hp || 0).toFixed(1)} hp`;
}

// Signed with a real minus sign; zero renders without a sign.
export function formatDelta(value, unit, digits = 1) {
  const numericValue = Number(value || 0);
  const rounded = Number(numericValue.toFixed(digits));
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "";
  return `${sign}${Math.abs(rounded).toFixed(digits)}${unit ? ` ${unit}` : ""}`;
}

export function toTitleCase(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
