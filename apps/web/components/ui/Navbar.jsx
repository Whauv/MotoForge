"use client";

export default function Navbar({ bikeName, onSaveBuild }) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-6 py-4">
      <div className="text-2xl font-black tracking-tight text-orange-500">MotoForge</div>
      <div className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-400">
        {bikeName || "Select a Bike"}
      </div>
      <button
        type="button"
        onClick={onSaveBuild}
        className="rounded-full border border-orange-400/30 bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
      >
        Save Build
      </button>
    </header>
  );
}
