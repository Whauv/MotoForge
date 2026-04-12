"use client";

export default function Spinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-700 border-t-orange-500" />
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
          Loading MotoForge...
        </p>
      </div>
    </div>
  );
}
