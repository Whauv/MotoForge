"use client";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function QuotationPanel({
  baseBike,
  selectedParts = [],
  ownsBike = false,
  quote = null,
  onGeneratePDF,
}) {
  const partsSubtotal =
    quote?.parts_subtotal ??
    selectedParts.reduce((sum, part) => sum + (part.price || 0), 0);
  const catalogBasePrice = baseBike?.base_price || 0;
  const basePrice = quote?.base_price_included ?? (ownsBike ? 0 : catalogBasePrice);
  const grandTotal = quote?.total_price ?? basePrice + partsSubtotal;

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5">
      <div className="space-y-3">
        {(quote?.line_items?.length ? quote.line_items : selectedParts).map((item, index) => (
          <div
            key={`${item.id || item.name}-${index}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{item.name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                {item.category || "Part"}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-orange-300">
              {formatCurrency(item.price)}
            </span>
          </div>
        ))}

        {!selectedParts.length && !(quote?.line_items?.length > 0) ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 px-4 py-6 text-center text-sm text-zinc-500">
            No parts selected yet.
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-3 border-t border-zinc-800 pt-4 text-sm">
        <div className="flex items-center justify-between text-zinc-400">
          <span>{ownsBike ? "Owned Bike Credit" : "Base Bike Price"}</span>
          <span>{ownsBike ? "Included by owner" : formatCurrency(basePrice)}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-400">
          <span>Parts Subtotal</span>
          <span>{formatCurrency(partsSubtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-bold text-orange-400">
          <span>Grand Total</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onGeneratePDF?.()}
        className="mt-6 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
      >
        Generate PDF Quote
      </button>
    </div>
  );
}
