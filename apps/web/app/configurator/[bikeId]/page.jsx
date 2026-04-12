"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import Navbar from "../../../components/ui/Navbar";
import Spinner from "../../../components/ui/Spinner";
import BikeViewer from "../../../components/viewer/BikeViewer";
import ModSidebar from "../../../components/sidebar/ModSidebar";
import { generateQuotePDF } from "../../../components/quotation/PDFExport";
import useBike from "../../../hooks/useBike";
import useParts from "../../../hooks/useParts";
import useQuote from "../../../hooks/useQuote";

export default function ConfiguratorPage() {
  const params = useParams();
  const bikeId = Array.isArray(params?.bikeId) ? params.bikeId[0] : params?.bikeId;
  const numericBikeId = Number(bikeId);

  const { bike, loading: bikeLoading } = useBike(numericBikeId);
  const { parts, loading: partsLoading } = useParts(numericBikeId);
  const { selectedParts, togglePart, quote, quoteLoading } = useQuote(numericBikeId);

  const selectedMods = useMemo(
    () =>
      selectedParts.map((part) => ({
        model_url: part.model_url,
        category: part.category,
      })),
    [selectedParts],
  );

  const handleSaveBuild = () => {
    if (typeof window === "undefined" || !bike) {
      return;
    }

    const buildPayload = {
      bikeId: bike.id,
      bikeName: bike.name,
      selectedParts,
      savedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(`motoforge-build-${bike.id}`, JSON.stringify(buildPayload));
  };

  if (bikeLoading || partsLoading) {
    return <Spinner />;
  }

  if (!bike) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-center">
        <div className="max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8">
          <h1 className="text-2xl font-bold text-white">Bike Not Found</h1>
          <p className="mt-3 text-sm text-zinc-400">
            We couldn&apos;t load this motorcycle configuration. Please return to the home page and try again.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar bikeName={bike.name} onSaveBuild={handleSaveBuild} />

      <div className="flex min-h-[calc(100vh-73px)] flex-col xl:flex-row">
        <section className="flex w-full items-center justify-center px-6 py-6 xl:w-[70%]">
          <div className="gradient-border w-full max-w-6xl rounded-[34px] p-[2px]">
            <div className="rounded-[32px] bg-zinc-950/95 p-4">
              <BikeViewer bikeModelUrl={bike.model_url} selectedMods={selectedMods} />
              {quoteLoading ? (
                <div className="mt-4 text-right text-xs font-semibold uppercase tracking-[0.28em] text-orange-400">
                  Updating quote...
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="w-full border-l border-zinc-800 xl:w-[30%]">
          <ModSidebar
            parts={parts}
            selectedParts={selectedParts}
            onTogglePart={togglePart}
            baseBike={bike}
            quote={quote}
            onGeneratePDF={() => generateQuotePDF(bike, selectedParts, quote)}
          />
        </section>
      </div>
    </main>
  );
}
