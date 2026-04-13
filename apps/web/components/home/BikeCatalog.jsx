"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  fetchCatalogBrands,
  fetchCatalogModels,
  importCatalogMotorcycle,
} from "../../lib/api";
import { formatHP, formatPrice, formatWeight } from "../../lib/formatters";

function normalizeModelName(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildYearOptions(currentYear) {
  const years = [];
  for (let year = currentYear; year >= 2015; year -= 1) {
    years.push(String(year));
  }
  return ["all", ...years];
}

export default function BikeCatalog({ motorcycles = [] }) {
  const router = useRouter();
  const [selectedMake, setSelectedMake] = useState("all");
  const [selectedMakeId, setSelectedMakeId] = useState("");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [ownsBike, setOwnsBike] = useState(false);
  const [brandOptions, setBrandOptions] = useState([]);
  const [catalogModels, setCatalogModels] = useState([]);
  const [catalogSource, setCatalogSource] = useState("local");
  const [catalogAttribution, setCatalogAttribution] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const currentYear = new Date().getFullYear();

  const localBrands = useMemo(
    () => ["all", ...new Set(motorcycles.map((bike) => bike.brand).sort())],
    [motorcycles],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadBrands() {
      setCatalogLoading(true);

      try {
        const response = await fetchCatalogBrands();
        if (!isMounted) {
          return;
        }

        setCatalogSource(response.source || "local");
        setCatalogAttribution(response.attribution || null);
        setBrandOptions(response.items || []);
      } catch {
        if (!isMounted) {
          return;
        }

        setCatalogSource("local");
        setCatalogAttribution(null);
        setBrandOptions(
          localBrands
            .filter((brand) => brand !== "all")
            .map((brand) => ({ id: brand, name: brand })),
        );
      } finally {
        if (isMounted) {
          setCatalogLoading(false);
        }
      }
    }

    loadBrands();

    return () => {
      isMounted = false;
    };
  }, [localBrands]);

  useEffect(() => {
    let isMounted = true;

    async function loadModels() {
      if (selectedMake === "all") {
        setCatalogModels([]);
        return;
      }

      setModelsLoading(true);

      try {
        const response = await fetchCatalogModels(selectedMake, selectedMakeId);
        if (!isMounted) {
          return;
        }

        setCatalogSource(response.source || "local");
        setCatalogAttribution(response.attribution || null);
        setCatalogModels(response.items || []);
      } catch {
        if (!isMounted) {
          return;
        }

        const fallbackItems = motorcycles
          .filter((bike) => bike.brand === selectedMake && bike.year >= 2015)
          .reduce((items, bike) => {
            const existing = items.find((item) => item.name === bike.name);
            if (existing) {
              existing.years = Array.from(new Set([...existing.years, bike.year])).sort(
                (left, right) => right - left,
              );
              return items;
            }

            items.push({
              id: `${selectedMake}:${bike.name}`,
              name: bike.name,
              years: [bike.year],
            });
            return items;
          }, []);

        setCatalogModels(fallbackItems);
      } finally {
        if (isMounted) {
          setModelsLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      isMounted = false;
    };
  }, [motorcycles, selectedMake, selectedMakeId]);

  const availableYears = useMemo(() => {
    if (selectedModel === "all") {
      return buildYearOptions(currentYear);
    }

    const selectedModelData = catalogModels.find(
      (item) => item.name === selectedModel,
    );
    if (!selectedModelData || !selectedModelData.years?.length) {
      return buildYearOptions(currentYear);
    }

    return ["all", ...selectedModelData.years.map((year) => String(year))];
  }, [catalogModels, currentYear, selectedModel]);

  const selectedModelData = useMemo(
    () => catalogModels.find((item) => item.name === selectedModel),
    [catalogModels, selectedModel],
  );

  const filteredMotorcycles = useMemo(
    () =>
      motorcycles.filter((bike) => {
        if (bike.year < 2015) {
          return false;
        }
        if (selectedMake !== "all" && bike.brand !== selectedMake) {
          return false;
        }
        if (
          selectedModel !== "all"
          && normalizeModelName(bike.name) !== normalizeModelName(selectedModel)
        ) {
          return false;
        }
        if (selectedYear !== "all" && String(bike.year) !== selectedYear) {
          return false;
        }
        return true;
      }),
    [motorcycles, selectedMake, selectedModel, selectedYear],
  );

  const hasSpecificSelection =
    selectedMake !== "all"
    || selectedModel !== "all"
    || selectedYear !== "all";
  const liveCatalogEnabled = catalogSource !== "local";
  const canImportSelection =
    liveCatalogEnabled
    && selectedMake !== "all"
    && selectedModel !== "all"
    && selectedYear !== "all";

  const handleMakeChange = (event) => {
    const brandName = event.target.value;
    const matchedBrand = brandOptions.find((brand) => brand.name === brandName);

    setSelectedMake(brandName);
    setSelectedMakeId(brandName === "all" ? "" : matchedBrand?.id || "");
    setSelectedModel("all");
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

  const handleImportBike = async () => {
    if (!canImportSelection) {
      return;
    }

    setImportLoading(true);
    setImportError(null);

    try {
      const response = await importCatalogMotorcycle({
        brand_name: selectedMake,
        brand_id: selectedMakeId || null,
        model_name: selectedModel,
        model_id: selectedModelData?.id || null,
        year: Number(selectedYear),
        category: selectedModelData?.category || null,
      });

      handleBuild(response.id);
    } catch (error) {
      setImportError(error?.message || "Could not import this catalog bike yet.");
    } finally {
      setImportLoading(false);
    }
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
              <option value="all">All manufacturers</option>
              {brandOptions.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
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
              onChange={(event) => {
                setSelectedModel(event.target.value);
                setSelectedYear("all");
              }}
              disabled={selectedMake === "all" || modelsLoading}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-orange-400"
            >
              <option value="all">
                {selectedMake === "all" ? "Select a make first" : "All models"}
              </option>
              {catalogModels.map((model) => (
                <option key={model.id} value={model.name}>
                  {model.name}
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

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span className="rounded-full border border-zinc-700 px-3 py-1 uppercase tracking-[0.24em]">
            {catalogLoading ? "Loading catalog" : `Catalog source: ${catalogSource}`}
          </span>
          {catalogAttribution ? (
            <span>Live catalog data by {catalogAttribution}. Only imported bikes can be configured.</span>
          ) : (
            <span>Using the local MotoForge catalog currently imported into the app.</span>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Choose Your Bike</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Search the live motorcycle catalog by make, model, and year from 2015
            to the present, then continue with bikes already imported into MotoForge.
          </p>
        </div>
        <div className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
          {filteredMotorcycles.length} configurable build
          {filteredMotorcycles.length === 1 ? "" : "s"}
        </div>
      </div>

      {filteredMotorcycles.length > 0 ? (
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
      ) : (
        <div className="rounded-[32px] border border-zinc-800 bg-zinc-900/60 p-10 text-center">
          <h3 className="text-xl font-semibold text-white">
            {hasSpecificSelection && liveCatalogEnabled
              ? "Catalog match found, but it is not imported yet"
              : "No bikes match this filter yet"}
          </h3>
          <p className="mt-3 text-sm text-zinc-400">
            {hasSpecificSelection && liveCatalogEnabled
              ? "The live catalog can list this motorcycle, but the MotoForge configurator only unlocks bikes that have already been imported with compatibility data."
              : "Try another make, model, or year. The current configurator only shows motorcycles that have been imported into MotoForge."}
          </p>
          {hasSpecificSelection && liveCatalogEnabled ? (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleImportBike}
                disabled={!canImportSelection || importLoading}
                className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importLoading ? "Importing..." : "Request / Import This Bike"}
              </button>
              {!canImportSelection ? (
                <p className="mt-3 text-xs text-zinc-500">
                  Select a specific make, model, and year to import it.
                </p>
              ) : null}
              {importError ? (
                <p className="mt-3 text-xs text-red-300">{importError}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
