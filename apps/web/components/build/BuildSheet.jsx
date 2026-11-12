"use client";

import { AnimatePresence, motion } from "motion/react";

import AnimatedNumber from "../ui/AnimatedNumber";
import { formatPrice, toTitleCase } from "../../lib/formatters";

function OwnershipToggle({ ownsBike, onChange }) {
  const options = [
    { value: false, label: "Buying the bike" },
    { value: true, label: "I own it" },
  ];

  return (
    <div role="radiogroup" aria-label="Quote includes" className="relative grid grid-cols-2 rounded-panel bg-bench-sunk p-1 text-sm">
      {options.map((option) => {
        const active = option.value === ownsBike;
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative rounded-part px-3 py-1.5 font-medium transition-colors ${
              active ? "text-graphite" : "text-graphite-soft hover:text-graphite"
            }`}
          >
            {active ? (
              <motion.span layoutId="ownership-thumb" aria-hidden className="absolute inset-0 rounded-part bg-bench-raised shadow-sm" />
            ) : null}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function BuildSheet({
  baseBike,
  categoryCount,
  selectedParts,
  onRemovePart,
  ownsBike,
  onOwnsBikeChange,
  quote,
  quoteStatus,
  quoteError,
  onDownloadQuote,
}) {
  const basePrice = quote?.base_price_included ?? (ownsBike ? 0 : baseBike.base_price);
  const partsSubtotal = quote?.parts_subtotal ?? 0;
  const total = quote?.total_price ?? basePrice;
  const formatRupees = (value) => formatPrice(value);

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="stretch-semi-expanded text-lg font-bold">Your build</h2>
        <span className="text-sm text-graphite-soft">
          {selectedParts.length ? `${selectedParts.length} of ${categoryCount} areas changed` : "Stock"}
        </span>
      </div>

      <ul className="space-y-1">
        <AnimatePresence initial={false}>
          {selectedParts.map((part) => (
            <motion.li
              key={part.id}
              layout
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="flex items-center justify-between gap-3 border-l-[3px] border-anodized py-1 pl-3"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{part.name}</span>
                <span className="block text-xs text-graphite-soft">{toTitleCase(part.category)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-sm tabular-nums">{formatPrice(part.price)}</span>
                <button
                  type="button"
                  onClick={() => onRemovePart(part)}
                  aria-label={`Remove ${part.name}`}
                  className="grid h-7 w-7 place-items-center rounded-part text-graphite-soft hover:bg-bench-sunk hover:text-graphite"
                >
                  <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <OwnershipToggle ownsBike={ownsBike} onChange={onOwnsBikeChange} />

      <dl className="space-y-2 border-t border-steel/60 pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-graphite-soft">{baseBike.brand} {baseBike.name}</dt>
          <dd className="tabular-nums">{ownsBike ? "Already owned" : formatPrice(basePrice)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-graphite-soft">Parts</dt>
          <dd className="tabular-nums">{formatPrice(partsSubtotal)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 pt-2">
          <dt className="font-semibold">Total</dt>
          <dd>
            <AnimatedNumber
              value={total}
              format={formatRupees}
              className="stretch-expanded text-2xl font-extrabold tabular-nums"
            />
          </dd>
        </div>
      </dl>

      <p aria-live="polite" className="min-h-5 text-sm text-graphite-soft">
        {quoteStatus === "error"
          ? `The quote didn't update: ${quoteError?.message || "the API is unreachable"}. Change a part to retry.`
          : quoteStatus === "loading"
            ? "Updating quote"
            : ""}
      </p>

      <button
        type="button"
        onClick={onDownloadQuote}
        disabled={!quote || quoteStatus !== "ready"}
        className="w-full rounded-panel bg-anodized px-4 py-3 font-semibold text-white transition-colors hover:bg-anodized-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        Download quote (PDF)
      </button>
    </div>
  );
}
