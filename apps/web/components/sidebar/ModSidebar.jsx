"use client";

import ModCategory from "./ModCategory";
import StatsPanel from "../performance/StatsPanel";
import QuotationPanel from "../quotation/QuotationPanel";

export default function ModSidebar({
  parts = {},
  selectedParts = [],
  onTogglePart,
  baseBike,
  ownsBike = false,
  quote = null,
  onGeneratePDF,
}) {
  const categories = Object.keys(parts);

  return (
    <aside className="h-full overflow-y-auto bg-zinc-900 px-5 py-6 text-white">
      <div className="space-y-8">
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Modifications</h2>
            <p className="text-sm text-zinc-400">Choose parts to tune the look and performance of your build.</p>
          </div>
          <div className="space-y-4">
            {categories.map((category) => (
              <ModCategory
                key={category}
                categoryName={category}
                parts={parts[category]}
                selectedParts={selectedParts}
                onTogglePart={onTogglePart}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Performance</h2>
            <p className="text-sm text-zinc-400">Live projected output based on the active modification stack.</p>
          </div>
          <StatsPanel baseBike={baseBike} selectedParts={selectedParts} />
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Quotation</h2>
            <p className="text-sm text-zinc-400">Review itemized pricing and export a polished build quote.</p>
          </div>
          <QuotationPanel
            baseBike={baseBike}
            selectedParts={selectedParts}
            ownsBike={ownsBike}
            quote={quote}
            onGeneratePDF={onGeneratePDF}
          />
        </section>
      </div>
    </aside>
  );
}
