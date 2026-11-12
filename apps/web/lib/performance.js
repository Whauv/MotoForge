// Illustrative power curves for the dyno chart. MotoForge only knows peak
// power, so the curve shape is a generic road-bike profile scaled to that
// peak; the UI labels it as an estimate.

const SAMPLES = 40;
const PEAK_AT = 0.86; // fraction of the rev range where peak power lands

function stockShape(t) {
  if (t <= PEAK_AT) {
    const x = t / PEAK_AT;
    return 0.08 + 0.92 * (1 - (1 - x) ** 2.1);
  }
  const over = (t - PEAK_AT) / (1 - PEAK_AT);
  return 1 - 0.07 * over ** 1.6;
}

export function powerCurve(peakHp, gainHp = 0) {
  // Bolt-on gains (exhausts, intakes) mostly show up in the upper revs.
  return Array.from({ length: SAMPLES + 1 }, (_, index) => {
    const t = index / SAMPLES;
    const stock = peakHp * stockShape(t);
    const gainShare = Math.min(1, (t / PEAK_AT) ** 2);
    return { t, hp: stock + gainHp * gainShare * stockShape(t) };
  });
}

export function curveToPath(points, { width, height, maxHp }) {
  return points
    .map(({ t, hp }, index) => {
      const x = (t * width).toFixed(2);
      const y = (height - (hp / maxHp) * height).toFixed(2);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

export function powerToWeight(hp, weightKg) {
  if (!weightKg) {
    return 0;
  }
  return (hp / weightKg) * 1000;
}

// Client-side mirror of the API quote maths, used only by the static
// landing-page demo where there is no backend round trip.
export function summarizeBuild(bike, parts, { ownsBike = false } = {}) {
  const partsSubtotal = parts.reduce((sum, part) => sum + part.price, 0);
  const hpGain = parts.reduce((sum, part) => sum + part.hp_delta, 0);
  const weightChange = parts.reduce((sum, part) => sum + part.weight_delta, 0);
  const basePriceIncluded = ownsBike ? 0 : bike.base_price;
  return {
    total_price: basePriceIncluded + partsSubtotal,
    base_price_included: basePriceIncluded,
    parts_subtotal: partsSubtotal,
    new_hp: bike.base_hp + hpGain,
    new_weight_kg: bike.base_weight_kg + weightChange,
    hp_gain: hpGain,
    weight_change: weightChange,
  };
}
