"use client";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatWeightDelta = (value = 0) => {
  const absValue = Math.abs(value).toFixed(1);
  if (value < 0) {
    return `−${absValue} kg`;
  }
  if (value > 0) {
    return `+${absValue} kg`;
  }
  return `0.0 kg`;
};

const formatHpDelta = (value = 0) => {
  if (value > 0) {
    return `+${value.toFixed(1)} HP`;
  }
  if (value < 0) {
    return `${value.toFixed(1)} HP`;
  }
  return "0.0 HP";
};

export default function ModCard({ part, isSelected, onToggle }) {
  return (
    <article
      className={`rounded-2xl border bg-zinc-950/80 p-4 transition ${
        isSelected
          ? "border-orange-400 shadow-[0_0_0_1px_rgba(251,146,60,0.4),0_0_24px_rgba(249,115,22,0.18)]"
          : "border-zinc-800 hover:border-zinc-700"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white">{part.name}</h3>
          <p className="text-xs leading-5 text-zinc-400">{part.description}</p>
        </div>
        <div className="shrink-0 text-sm font-semibold text-orange-300">{formatCurrency(part.price)}</div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs font-medium">
        <span className={part.weight_delta <= 0 ? "text-emerald-400" : "text-rose-400"}>
          {formatWeightDelta(part.weight_delta)}
        </span>
        <span className={part.hp_delta >= 0 ? "text-emerald-400" : "text-rose-400"}>
          {formatHpDelta(part.hp_delta)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onToggle(part)}
        className={`mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-400/60 ${
          isSelected
            ? "border border-orange-400/30 bg-zinc-900 text-orange-300 hover:bg-zinc-800"
            : "bg-orange-500 text-white hover:bg-orange-400"
        }`}
      >
        {isSelected ? "Remove" : "Apply"}
      </button>
    </article>
  );
}
