"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

import { curveToPath, powerCurve } from "../../lib/performance";

const WIDTH = 320;
const HEIGHT = 120;

export default function DynoChart({ baseHp, hpGain = 0 }) {
  const { stockPath, buildPath } = useMemo(() => {
    const ceiling = Math.max(baseHp + Math.max(hpGain, 0), baseHp) * 1.12 || 1;
    const dims = { width: WIDTH, height: HEIGHT, maxHp: ceiling };
    return {
      stockPath: curveToPath(powerCurve(baseHp), dims),
      buildPath: curveToPath(powerCurve(baseHp, hpGain), dims),
    };
  }, [baseHp, hpGain]);

  const hasGain = Math.abs(hpGain) >= 0.05;

  return (
    <figure className="min-w-0">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-28 w-full overflow-visible"
        role="img"
        aria-label={
          hasGain
            ? `Estimated power curve: stock and with this build, peaking ${hpGain.toFixed(1)} hp higher.`
            : "Estimated stock power curve."
        }
      >
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1="0"
            x2={WIDTH}
            y1={HEIGHT * fraction}
            y2={HEIGHT * fraction}
            className="stroke-steel/40"
            strokeWidth="1"
          />
        ))}
        <line x1="0" x2={WIDTH} y1={HEIGHT} y2={HEIGHT} className="stroke-steel" strokeWidth="1" />
        <path d={stockPath} fill="none" className="stroke-graphite-soft" strokeWidth="1.5" strokeDasharray="3 4" />
        <motion.path
          initial={false}
          animate={{ d: buildPath, opacity: hasGain ? 1 : 0 }}
          fill="none"
          className="stroke-heat"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-graphite-soft">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-px w-4 border-t border-dashed border-graphite-soft" />
          Stock
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-4 bg-heat" />
          This build
        </span>
        <span>Curve estimated from peak power</span>
      </figcaption>
    </figure>
  );
}
