"use client";

const formatDelta = (value = 0, unit = "") => {
  const prefix = value > 0 ? "+" : value < 0 ? "−" : "";
  const amount = Math.abs(value).toFixed(1);
  return `${prefix}${amount} ${unit}`.trim();
};

export default function StatCard({ label, value, unit, delta, deltaUnit }) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const deltaTone = isPositive
    ? "bg-emerald-500/15 text-emerald-300"
    : isNegative
      ? "bg-rose-500/15 text-rose-300"
      : "bg-zinc-700/60 text-zinc-300";
  const arrow = isPositive ? "↑" : isNegative ? "↓" : "•";

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">{label}</p>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${deltaTone}`}>
          {arrow} {formatDelta(delta, deltaUnit)}
        </span>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-3xl font-black tracking-tight text-white transition-all duration-300">
          {Number(value ?? 0).toFixed(1)}
        </span>
        <span className="pb-1 text-sm font-medium text-zinc-400">{unit}</span>
      </div>
    </article>
  );
}
