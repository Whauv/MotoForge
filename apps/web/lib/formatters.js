const priceFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatPrice(amount) {
  return `₹${priceFormatter.format(Number(amount || 0))}`;
}

export function formatWeight(kg) {
  return `${Number(kg || 0)} kg`;
}

export function formatHP(hp) {
  return `${Number(hp || 0).toFixed(1)} HP`;
}

export function formatDelta(value, unit) {
  const numericValue = Number(value || 0);
  const sign = numericValue > 0 ? "+" : numericValue < 0 ? "−" : "";
  return `${sign}${Math.abs(numericValue).toFixed(1)} ${unit}`;
}

export function formatBuildId(hex) {
  return `BUILD #${String(hex || "").toUpperCase()}`;
}
