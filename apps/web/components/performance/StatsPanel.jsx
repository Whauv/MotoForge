"use client";

import { useMemo } from "react";

import StatCard from "./StatCard";

export default function StatsPanel({ baseBike, selectedParts = [] }) {
  const stats = useMemo(() => {
    const hpGain = selectedParts.reduce((sum, part) => sum + (part.hp_delta || 0), 0);
    const weightChange = selectedParts.reduce((sum, part) => sum + (part.weight_delta || 0), 0);
    const currentHp = (baseBike?.base_hp || 0) + hpGain;
    const currentWeight = (baseBike?.base_weight_kg || 0) + weightChange;

    return {
      currentHp,
      currentWeight,
      hpGain,
      weightChange,
    };
  }, [baseBike, selectedParts]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="HP" value={stats.currentHp} unit="HP" delta={stats.hpGain} deltaUnit="HP" />
      <StatCard
        label="Weight"
        value={stats.currentWeight}
        unit="kg"
        delta={stats.weightChange}
        deltaUnit="kg"
      />
      <StatCard label="HP Gain" value={stats.hpGain} unit="HP" delta={stats.hpGain} deltaUnit="HP" />
      <StatCard
        label="Weight Change"
        value={stats.weightChange}
        unit="kg"
        delta={stats.weightChange}
        deltaUnit="kg"
      />
    </div>
  );
}
