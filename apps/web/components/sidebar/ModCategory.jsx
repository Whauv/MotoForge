"use client";

import { useMemo, useState } from "react";

import ModCard from "./ModCard";
import Badge from "../ui/Badge";

const toTitleCase = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function ModCategory({
  categoryName,
  parts = [],
  selectedParts = [],
  onTogglePart,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const selectedCount = useMemo(
    () => selectedParts.filter((part) => part.category === categoryName).length,
    [categoryName, selectedParts],
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-zinc-900/70"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Badge label={categoryName} color={categoryName} />
          <div>
            <p className="text-sm font-semibold text-white">{toTitleCase(categoryName)}</p>
            <p className="text-xs text-zinc-500">{selectedCount} selected</p>
          </div>
        </div>
        <div className="text-sm font-semibold text-zinc-400">
          {isOpen ? "−" : "+"}
        </div>
      </button>

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
          isOpen ? "max-h-[2400px]" : "max-h-0"
        }`}
      >
        <div className="space-y-3 border-t border-zinc-800 px-4 py-4">
          {parts.map((part) => (
            <ModCard
              key={part.id}
              part={part}
              isSelected={selectedParts.some((selectedPart) => selectedPart.id === part.id)}
              onToggle={onTogglePart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
