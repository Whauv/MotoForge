"use client";

import { Suspense, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";

import BuildSheet from "../../../components/build/BuildSheet";
import CopyLinkButton from "../../../components/build/CopyLinkButton";
import PartPicker from "../../../components/build/PartPicker";
import PerformanceFigures from "../../../components/build/PerformanceFigures";
import SiteHeader from "../../../components/ui/SiteHeader";
import Spinner from "../../../components/ui/Spinner";
import useBike from "../../../hooks/useBike";
import useBuild from "../../../hooks/useBuild";
import useParts from "../../../hooks/useParts";

const BikeViewer = dynamic(() => import("../../../components/viewer/BikeViewer"), {
  ssr: false,
  loading: () => <div className="h-[52vh] min-h-[340px] bg-bench-sunk/40 lg:h-[calc(100vh-4rem-15rem)]" />,
});

async function downloadQuote(...args) {
  // jsPDF is only needed when someone actually downloads a quote.
  const { generateQuotePDF } = await import("../../../components/quotation/PDFExport");
  generateQuotePDF(...args);
}

function LoadProblem({ title, children }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <h1 className="stretch-semi-expanded text-3xl font-extrabold">{title}</h1>
      <p className="mt-4 text-graphite-soft">{children}</p>
      <Link
        href="/product"
        className="mt-8 inline-block rounded-panel bg-anodized px-4 py-3 font-semibold text-white hover:bg-anodized-deep"
      >
        Choose a bike
      </Link>
    </main>
  );
}

function Configurator() {
  const params = useParams();
  const rawId = Array.isArray(params?.bikeId) ? params.bikeId[0] : params?.bikeId;
  const bikeId = Number(rawId);

  const { bike, loading: bikeLoading, error: bikeError } = useBike(bikeId);
  const { parts, loading: partsLoading } = useParts(bikeId);
  const ready = Boolean(bike) && !partsLoading;
  const build = useBuild(ready ? bikeId : null, parts);
  const [openCategory, setOpenCategory] = useState(null);

  const categories = Object.keys(parts);
  const selectedMods = useMemo(
    () => build.selectedParts.map((part) => ({ model_url: part.model_url, category: part.category })),
    [build.selectedParts],
  );
  const hotspots = useMemo(
    () =>
      categories.map((category) => ({
        category,
        fitted: build.selectedParts.some((part) => part.category === category),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories.join(","), build.selectedParts],
  );

  if (bikeLoading || partsLoading) {
    return <Spinner label="Loading the bike and its compatible parts" />;
  }

  if (!bike) {
    return bikeError?.status === 404 ? (
      <LoadProblem title="We couldn't find that bike">
        It may have been removed from the catalog. Pick another bike to start a build.
      </LoadProblem>
    ) : (
      <LoadProblem title="The configurator can't reach the API">
        {bikeError?.message || "The bike didn't load."} Check that the API is running, then reload this page.
      </LoadProblem>
    );
  }

  const summary = build.quote;

  return (
    <>
      <SiteHeader>
        <p className="hidden min-w-0 truncate text-sm sm:block">
          <span className="stretch-condensed text-base font-bold">
            {bike.brand} {bike.name}
          </span>{" "}
          <span className="text-graphite-soft">{bike.year}</span>
        </p>
        <Link href="/product" className="hidden text-sm font-medium text-graphite-soft hover:text-graphite md:inline">
          Change bike
        </Link>
        <CopyLinkButton />
      </SiteHeader>

      <main className="mx-auto grid max-w-[1600px] lg:grid-cols-[minmax(0,1fr)_420px]">
        <section aria-label="Bike preview" className="min-w-0">
          <h1 className="stretch-condensed px-5 pt-5 text-3xl font-extrabold sm:hidden">
            {bike.brand} {bike.name}
          </h1>
          <BikeViewer
            bikeModelUrl={bike.model_url}
            selectedMods={selectedMods}
            hotspots={hotspots}
            activeCategory={openCategory}
            onHotspotSelect={(category) => setOpenCategory((current) => (current === category ? null : category))}
            className="h-[52vh] min-h-[340px] lg:h-[calc(100vh-4rem-15rem)]"
          />
          <div className="border-t border-steel/60 px-5 py-6 md:px-8">
            <PerformanceFigures baseBike={bike} summary={summary} />
          </div>
        </section>

        <aside className="flex flex-col border-steel/60 lg:sticky lg:top-0 lg:h-[calc(100vh-4rem)] lg:border-l">
          <div className="flex-1 px-5 pb-6 pt-6 md:px-6 lg:overflow-y-auto lg:[mask-image:linear-gradient(to_bottom,black_calc(100%-2.5rem),transparent)]">
            <h2 className="stretch-semi-expanded text-lg font-bold">Parts that fit this bike</h2>
            <p className="mt-1 text-sm text-graphite-soft">
              One part per area. Pick an area here or on the bike.
            </p>
            <div className="mt-3">
              <PartPicker
                partsByCategory={parts}
                selectedParts={build.selectedParts}
                openCategory={openCategory}
                onOpenCategory={setOpenCategory}
                onTogglePart={build.togglePart}
              />
            </div>
          </div>
          <div className="border-t border-steel/60 bg-bench-raised px-5 py-5 md:px-6">
            <BuildSheet
              baseBike={bike}
              categoryCount={categories.length}
              selectedParts={build.selectedParts}
              onRemovePart={build.togglePart}
              ownsBike={build.ownsBike}
              onOwnsBikeChange={build.setOwnsBike}
              quote={summary}
              quoteStatus={build.quoteStatus}
              quoteError={build.quoteError}
              onDownloadQuote={() =>
                downloadQuote(bike, build.selectedParts, summary, { ownsBike: build.ownsBike })
              }
            />
          </div>
        </aside>
      </main>
    </>
  );
}

export default function ConfiguratorPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Configurator />
    </Suspense>
  );
}
