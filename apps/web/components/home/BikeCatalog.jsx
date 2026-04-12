"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { formatHP, formatPrice, formatWeight } from "../../lib/formatters";

export default function BikeCatalog({ motorcycles = [] }) {
  const router = useRouter();
  const [selectedMake, setSelectedMake] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [ownsBike, setOwnsBike] = useState(false);

  const makes = useMemo(
    () => ["all", ...new Set(motorcycles.map((bike) => bike.brand).sort())],
    [motorcycles],
  );

  const availableModels = useMemo(() => {
    const filtered = selectedMake === "all"
      ? motorcycles
      : motorcycles.filter((bike) => bike.brand === selectedMake);

    return ["all", ...new Set(filtered.map((bike) => bike.name).sort())];
  }, [motorcycles, selectedMake]);

  const availableYears = useMemo(() => {
    const filtered = motorcycles.filter((bike) => {
      if (selectedMake !== "all" && bike.brand !== selectedMake) {
        return false;
      }
      if (selectedModel !== "all" && bike.name !== selectedModel) {
        return false;
      }
      return bike.year >= 2000;
    });

    return ["all", ...new Set(filtered.map((bike) => String(bike.year)).sort((a, b) => Number(b) - Number(a)))];
  }, [motorcycles, selectedMake, selectedModel]);

  const filteredMotorcycles = useMemo(
    () =>
      motorcycles.filter((bike) => {
        if (bike.year < 2000) {
          return false;
        }
        if (selectedMake !== "all" && bike.brand !== selectedMake) {
          return false;
        }
        if (selectedModel !== "all" && bike.name !== selectedModel) {
          return false;
        }
        if (selectedYear !== "all" && String(bike.year) !== selectedYear) {
          return false;
        }
        return true;
      }),
    [motorcycles, selectedMake, selectedModel, selectedYear],
  );

  const handleMakeChange = (event) => {
    setSelectedMake(event.target.value);
    setSelectedModel("all");
    setSelectedYear("all");
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
    setSelectedYear("all");
  };

  const handleBuild = (bikeId) => {
    const params = new URLSearchParams();
    if (ownsBike) {
      params.set("ownsBike", "true");
    }
    const suffix = params.toString() ? `?${params.toString()}` : "";
    router.push(`/configurator/${bikeId}${suffix}`);
  };

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] border border-zinc-800 bg-zinc-900/70 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
        <div className="grid gap-4 lg:grid-cols-4">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Make
            </span>
            <select
              value={selectedMake}
              onChange={handleMakeChange}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              {makes.map((make) => (
                <option key={make} value={make}>
                  {make === "all" ? "All manufacturers" : make}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Model
            </span>
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model === "all" ? "All models" : model}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Year
            </span>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year === "all" ? "All years" : year}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-end">
            <div className="flex w-full items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3">
              <input
                id="owns-bike"
                type="checkbox"
                checked={ownsBike}
                onChange={(event) => setOwnsBike(event.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-orange-500 focus:ring-orange-400"
              />
              <div>
                <p className="text-sm font-semibold text-white">I already own this bike</p>
                <p className="text-xs text-zinc-500">Hide base bike pricing in the quote flow</p>
              </div>
            </div>
          </label>
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Choose Your Bike</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Explore a curated MotoForge catalog of popular makes, models, and years from 2000 onward.
          </p>
        </div>
        <div className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
          {filteredMotorcycles.length} build{filteredMotorcycles.length === 1 ? "" : "s"} available
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredMotorcycles.map((bike) => (
          <article
            key={bike.id}
            className="group rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 transition hover:border-orange-400/40 hover:bg-zinc-900 hover:shadow-[0_24px_60px_rgba(249,115,22,0.12)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                  {bike.brand}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white group-hover:text-orange-300">
                  {bike.name}
                </h3>
              </div>
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">
                {bike.year}
              </span>
            </div>

            <div className="mt-8 space-y-2 text-sm text-zinc-400">
              {!ownsBike ? (
                <div className="flex items-center justify-between">
                  <span>Base Price</span>
                  <span className="font-semibold text-orange-300">
                    {formatPrice(bike.base_price)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>Ownership Mode</span>
                  <span className="font-semibold text-emerald-300">Bike already owned</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Power</span>
                <span>{formatHP(bike.base_hp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Weight</span>
                <span>{formatWeight(bike.base_weight_kg)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleBuild(bike.id)}
              className="mt-8 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              Configure This Bike
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
