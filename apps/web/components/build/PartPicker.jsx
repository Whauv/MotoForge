"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

import { formatDelta, formatPrice, toTitleCase } from "../../lib/formatters";

const CATEGORY_ORDER = ["exhaust", "suspension", "wheels", "fairings", "handlebars"];

function PartRow({ part, category, selected, onToggle }) {
  const effects = [
    Math.abs(part.hp_delta) >= 0.05 ? formatDelta(part.hp_delta, "hp") : null,
    Math.abs(part.weight_delta) >= 0.05 ? formatDelta(part.weight_delta, "kg") : null,
  ].filter(Boolean);

  return (
    <li className="relative">
      {selected ? (
        // One bar per category: it slides to whichever part is fitted.
        <motion.span
          layoutId={`fitted-${category}`}
          aria-hidden
          className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-anodized"
        />
      ) : null}
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onToggle(part)}
        className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 rounded-part py-3 pl-4 pr-2 text-left transition-colors ${
          selected ? "bg-anodized-wash" : "hover:bg-bench-sunk/70"
        }`}
      >
        <span className="font-semibold">{part.name}</span>
        <span className="text-right font-semibold tabular-nums">{formatPrice(part.price)}</span>
        <span className="line-clamp-2 text-sm text-graphite-soft">{part.description}</span>
        <span className="text-right text-sm text-graphite-soft">
          {selected ? <span className="font-medium text-anodized-deep">Fitted</span> : effects.join(", ")}
        </span>
      </button>
    </li>
  );
}

function Category({ category, parts, selectedPart, open, onOpen, onToggle }) {
  const sectionRef = useRef(null);
  const panelId = `parts-${category}`;

  useEffect(() => {
    if (open) {
      sectionRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [open]);

  return (
    <section ref={sectionRef} className="border-b border-steel/50 last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onOpen(open ? null : category)}
          className="flex w-full items-baseline justify-between gap-4 py-4 text-left"
        >
          <span className="stretch-semi-expanded text-lg font-bold">{toTitleCase(category)}</span>
          <span className={`truncate text-sm ${selectedPart ? "text-anodized-deep" : "text-graphite-soft"}`}>
            {selectedPart ? selectedPart.name : `Stock, ${parts.length} ${parts.length === 1 ? "option" : "options"}`}
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="space-y-1 pb-4">
              {parts.map((part) => (
                <PartRow
                  key={part.id}
                  part={part}
                  category={category}
                  selected={selectedPart?.id === part.id}
                  onToggle={onToggle}
                />
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export default function PartPicker({ partsByCategory, selectedParts, openCategory, onOpenCategory, onTogglePart }) {
  const categories = Object.keys(partsByCategory).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );

  if (!categories.length) {
    return (
      <p className="py-6 text-sm text-graphite-soft">
        No compatible parts are listed for this bike yet. Pick another bike from the catalog, or
        add fitment data in the API seed.
      </p>
    );
  }

  return (
    <div>
      {categories.map((category) => (
        <Category
          key={category}
          category={category}
          parts={partsByCategory[category]}
          selectedPart={selectedParts.find((part) => part.category === category)}
          open={openCategory === category}
          onOpen={onOpenCategory}
          onToggle={onTogglePart}
        />
      ))}
    </div>
  );
}
