"use client";

import AnimatedNumber from "../ui/AnimatedNumber";
import DynoChart from "./DynoChart";
import { formatDelta } from "../../lib/formatters";
import { powerToWeight } from "../../lib/performance";

function Figure({ label, value, unit, delta, deltaUnit, betterWhen, digits = 1 }) {
  const rounded = Number((delta || 0).toFixed(digits));
  const improved = betterWhen === "up" ? rounded > 0 : rounded < 0;

  return (
    <div className="min-w-0">
      <p className="text-sm text-graphite-soft">{label}</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
        <AnimatedNumber
          value={value}
          format={(v) => v.toFixed(digits)}
          className="stretch-expanded text-2xl font-extrabold leading-none tracking-tight sm:text-4xl"
        />
        <span className="text-sm text-graphite-soft">{unit}</span>
      </p>
      <p
        className={`mt-2 text-sm font-medium ${
          rounded === 0 ? "text-graphite-soft" : improved ? "text-anodized-deep" : "text-graphite"
        }`}
      >
        {rounded === 0 ? "Stock" : (
          <>
            {formatDelta(rounded, deltaUnit, digits)}
            <span className="hidden sm:inline"> vs stock</span>
          </>
        )}
      </p>
    </div>
  );
}

export default function PerformanceFigures({ baseBike, summary }) {
  const hp = summary?.new_hp ?? baseBike.base_hp;
  const weight = summary?.new_weight_kg ?? baseBike.base_weight_kg;
  const hpGain = summary?.hp_gain ?? 0;
  const weightChange = summary?.weight_change ?? 0;
  const ratio = powerToWeight(hp, weight);
  const ratioDelta = ratio - powerToWeight(baseBike.base_hp, baseBike.base_weight_kg);

  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-8 md:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.6fr)] md:items-end md:gap-8">
      <Figure label="Peak power" value={hp} unit="hp" delta={hpGain} deltaUnit="hp" betterWhen="up" />
      <Figure label="Weight" value={weight} unit="kg" delta={weightChange} deltaUnit="kg" betterWhen="down" />
      <Figure
        label="Power to weight"
        value={ratio}
        unit="hp/t"
        delta={ratioDelta}
        deltaUnit="hp/t"
        betterWhen="up"
        digits={0}
      />
      <div className="col-span-3 md:col-span-1">
        <DynoChart baseHp={baseBike.base_hp} hpGain={hpGain} />
      </div>
    </div>
  );
}
