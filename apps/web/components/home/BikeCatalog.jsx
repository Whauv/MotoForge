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

  const selectClass =
    "w-full appearance-none rounded-panel border border-steel bg-bench-raised px-3 py-2.5 text-base disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-10">
      <section aria-label="Filter bikes" className="grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] md:items-end">
        <label className="space-y-1.5">
          <span className="block text-sm text-graphite-soft">Make</span>
          <select value={selectedMake} onChange={handleMakeChange} className={selectClass}>
            <option value="all">All makes</option>
            {brandOptions.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm text-graphite-soft">Model</span>
          <select
            value={selectedModel}
            onChange={(event) => {
              setSelectedModel(event.target.value);
              setSelectedYear("all");
            }}
            disabled={selectedMake === "all" || modelsLoading}
            className={selectClass}
          >
            <option value="all">{selectedMake === "all" ? "Choose a make first" : "All models"}</option>
            {catalogModels.map((model) => (
              <option key={model.id} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm text-graphite-soft">Year</span>
          <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className={selectClass}>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year === "all" ? "Any year" : year}
              </option>
            ))}
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-panel border border-steel bg-bench-raised px-3 py-2.5">
          <input
            type="checkbox"
            checked={ownsBike}
            onChange={(event) => setOwnsBike(event.target.checked)}
            className="h-4 w-4 accent-anodized"
          />
          <span className="text-base">I already own the bike</span>
        </label>
      </section>

      <p className="text-sm text-graphite-soft">
        {catalogLoading
          ? "Loading makes"
          : catalogAttribution
            ? `Makes and models from ${catalogAttribution}. Only bikes with fitment data can be configured.`
            : "Showing bikes in the MotoForge catalog."}
      </p>

      <section aria-labelledby="bike-list-heading">
        <div className="flex items-baseline justify-between gap-4 border-b border-graphite pb-3">
          <h2 id="bike-list-heading" className="stretch-semi-expanded text-2xl font-extrabold">
            Bikes you can configure
          </h2>
          <span className="text-sm text-graphite-soft">{filteredMotorcycles.length} found</span>
        </div>

        {filteredMotorcycles.length > 0 ? (
          <>
            <div
              aria-hidden
              className="hidden grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_minmax(0,1.2fr)_7rem] gap-6 py-3 text-sm text-graphite-soft md:grid"
            >
              <span>Bike</span>
              <span className="text-right">Power</span>
              <span className="text-right">Weight</span>
              <span className="text-right">Year</span>
              <span className="text-right">Price</span>
              <span />
            </div>
            <ul>
              {filteredMotorcycles.map((bike) => (
                <li
                  key={bike.id}
                  className="grid grid-cols-2 items-center gap-x-6 gap-y-2 border-t border-steel/60 py-5 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_minmax(0,1.2fr)_7rem] md:py-4"
                >
                  <p className="col-span-2 min-w-0 md:col-span-1">
                    <span className="block text-sm text-graphite-soft">{bike.brand}</span>
                    <span className="stretch-condensed block truncate text-2xl font-extrabold">{bike.name}</span>
                  </p>
                  <p className="text-sm md:text-right md:text-base">
                    <span className="text-graphite-soft md:hidden">Power </span>
                    {formatHP(bike.base_hp)}
                  </p>
                  <p className="text-sm md:text-right md:text-base">
                    <span className="text-graphite-soft md:hidden">Weight </span>
                    {formatWeight(bike.base_weight_kg)}
                  </p>
                  <p className="text-sm md:text-right md:text-base">
                    <span className="text-graphite-soft md:hidden">Year </span>
                    {bike.year}
                  </p>
                  <p className="text-sm tabular-nums md:text-right md:text-base">
                    <span className="text-graphite-soft md:hidden">Price </span>
                    {ownsBike ? <span className="text-graphite-soft">Not in quote</span> : formatPrice(bike.base_price)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleBuild(bike.id)}
                    aria-label={`Configure ${bike.brand} ${bike.name} ${bike.year}`}
                    className="col-span-2 w-full rounded-panel bg-anodized px-4 py-2.5 font-semibold text-white transition-colors hover:bg-anodized-deep md:col-span-1"
                  >
                    Configure
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="max-w-xl py-12">
            <h3 className="stretch-semi-expanded text-xl font-bold">
              {hasSpecificSelection && liveCatalogEnabled
                ? "This bike is in the catalog but has no fitment data yet"
                : "No bikes match these filters"}
            </h3>
            <p className="mt-2 text-graphite-soft">
              {hasSpecificSelection && liveCatalogEnabled
                ? "Import it to add it to MotoForge. Parts are matched to it by riding segment."
                : "Try a different make, model, or year."}
            </p>
            {hasSpecificSelection && liveCatalogEnabled ? (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleImportBike}
                  disabled={!canImportSelection || importLoading}
                  className="rounded-panel bg-anodized px-4 py-2.5 font-semibold text-white transition-colors hover:bg-anodized-deep disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importLoading ? "Importing bike" : "Import this bike"}
                </button>
                {!canImportSelection ? (
                  <p className="mt-3 text-sm text-graphite-soft">Choose a make, model, and year to import.</p>
                ) : null}
                {importError ? <p className="mt-3 text-sm text-graphite">{importError}</p> : null}
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
