"use client";

const colorMap = {
  exhaust: "bg-orange-500/15 text-orange-300 ring-orange-400/30",
  suspension: "bg-blue-500/15 text-blue-300 ring-blue-400/30",
  wheels: "bg-green-500/15 text-green-300 ring-green-400/30",
  fairings: "bg-purple-500/15 text-purple-300 ring-purple-400/30",
  handlebars: "bg-yellow-500/15 text-yellow-200 ring-yellow-400/30",
};

export default function Badge({ label, color }) {
  const normalized = String(color || label || "").toLowerCase();
  const tone = colorMap[normalized] || "bg-zinc-700/70 text-zinc-200 ring-white/10";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ring-1 ${tone}`}
    >
      {label}
    </span>
  );
}
