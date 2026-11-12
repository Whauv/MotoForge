"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";

import PerformanceFigures from "../build/PerformanceFigures";
import AnimatedNumber from "../ui/AnimatedNumber";
import { formatDelta, formatPrice } from "../../lib/formatters";
import { summarizeBuild } from "../../lib/performance";

const BikeViewer = dynamic(() => import("../viewer/BikeViewer"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-bench-sunk/40" />,
});

// Mirrors seed data in apps/api/seed/seed.py so the demo needs no API.
const DEMO_BIKE = {
  brand: "Yamaha",
  name: "MT-07",
  year: 2023,
  base_price: 759000,
  base_weight_kg: 184.0,
  base_hp: 73.4,
  model_url: "https://cdn.motoforge.local/models/yamaha-mt07-2023.glb",
};

const DEMO_PARTS = [
  {
    id: "exhaust",
    name: "Akrapovič Racing Line exhaust",
    category: "exhaust",
    price: 62000,
    weight_delta: -3.4,
    hp_delta: 5.6,
    model_url: "https://cdn.motoforge.local/models/parts/demo-exhaust.glb",
  },
  {
    id: "suspension",
    name: "Öhlins STX 46 rear shock",
    category: "suspension",
    price: 52000,
    weight_delta: -0.9,
    hp_delta: 0,
    model_url: "https://cdn.motoforge.local/models/parts/demo-shock.glb",
  },
  {
    id: "wheels",
    name: "Marchesini forged wheels",
    category: "wheels",
    price: 138000,
    weight_delta: -4.5,
    hp_delta: 0,
    model_url: "https://cdn.motoforge.local/models/parts/demo-wheels.glb",
  },
];

export default function DemoBuild() {
  const reduceMotion = useReducedMotion();
  const [fitted, setFitted] = useState([]);
  const touched = useRef(false);

  // The page's one unprompted moment: the exhaust goes on so the numbers
  // and the power curve visibly move. Skipped if the visitor acts first or
  // prefers reduced motion.
  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }
    const timer = setTimeout(() => {
      if (!touched.current) {
        setFitted(["exhaust"]);
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  const fittedParts = useMemo(() => DEMO_PARTS.filter((part) => fitted.includes(part.id)), [fitted]);
  const summary = useMemo(() => summarizeBuild(DEMO_BIKE, fittedParts), [fittedParts]);

  const toggle = (id) => {
    touched.current = true;
    setFitted((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  };

  return (
    <div className="grid border-y border-graphite lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="relative min-w-0 border-graphite lg:border-r">
        <BikeViewer
          bikeModelUrl={DEMO_BIKE.model_url}
          selectedMods={fittedParts}
          className="h-[46vh] min-h-[320px] lg:h-[520px]"
        />
        <p className="absolute left-4 top-4 text-sm">
          <span className="stretch-condensed text-xl font-extrabold">
            {DEMO_BIKE.brand} {DEMO_BIKE.name}
          </span>{" "}
          <span className="text-graphite-soft">{DEMO_BIKE.year}, sample build</span>
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-6 bg-bench-raised p-5 md:p-8">
        <div>
          <h2 className="stretch-semi-expanded text-lg font-bold">Try it: fit a part</h2>
          <ul className="mt-3 space-y-1">
            {DEMO_PARTS.map((part) => {
              const on = fitted.includes(part.id);
              const effects = [
                part.hp_delta ? formatDelta(part.hp_delta, "hp") : null,
                formatDelta(part.weight_delta, "kg"),
              ].filter(Boolean);
              return (
                <li key={part.id} className="relative">
                  {on ? (
                    <motion.span
                      layoutId={`demo-${part.id}`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      aria-hidden
                      className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-anodized"
                    />
                  ) : null}
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(part.id)}
                    className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-4 rounded-part py-2.5 pl-4 pr-2 text-left transition-colors ${
                      on ? "bg-anodized-wash" : "hover:bg-bench-sunk/70"
                    }`}
                  >
                    <span className="font-semibold">{part.name}</span>
                    <span className="text-right tabular-nums">{formatPrice(part.price)}</span>
                    <span className="text-sm text-graphite-soft">{effects.join(", ")}</span>
                    <span className="text-right text-sm font-medium text-anodized-deep">{on ? "Fitted" : ""}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <dl className="flex items-baseline justify-between gap-4 border-t border-steel/60 pt-4">
          <dt className="text-graphite-soft">Bike and parts</dt>
          <dd>
            <AnimatedNumber
              value={summary.total_price}
              format={formatPrice}
              className="stretch-expanded text-2xl font-extrabold tabular-nums"
            />
          </dd>
        </dl>
      </div>

      <div className="border-t border-graphite px-5 py-6 md:px-8 lg:col-span-2">
        <PerformanceFigures baseBike={DEMO_BIKE} summary={summary} />
      </div>
    </div>
  );
}
