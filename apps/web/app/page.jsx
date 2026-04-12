import Link from "next/link";

import { formatPrice } from "../lib/formatters";

async function getMotorcycles() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const response = await fetch(`${baseUrl}/api/motorcycles`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load motorcycles.");
  }

  return response.json();
}

export default async function HomePage() {
  const motorcycles = await getMotorcycles();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-zinc-800 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.2),transparent_35%),linear-gradient(180deg,#18181b_0%,#09090b_100%)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">
            3D Motorcycle Configurator
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-white md:text-7xl">
            MotoForge
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-300 md:text-xl">
            Visualize your build before you build it.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Available Motorcycles</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Start with a base machine, then step into the MotoForge configurator.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {motorcycles.map((bike) => (
            <Link
              key={bike.id}
              href={`/configurator/${bike.id}`}
              className="group rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 transition hover:border-orange-400/40 hover:bg-zinc-900 hover:shadow-[0_24px_60px_rgba(249,115,22,0.12)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                    {bike.brand}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-white group-hover:text-orange-300">
                    {bike.name}
                  </h3>
                </div>
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">
                  {bike.year}
                </span>
              </div>

              <div className="mt-8 space-y-2 text-sm text-zinc-400">
                <div className="flex items-center justify-between">
                  <span>Base Price</span>
                  <span className="font-semibold text-orange-300">{formatPrice(bike.base_price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Power</span>
                  <span>{bike.base_hp} HP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Weight</span>
                  <span>{bike.base_weight_kg} kg</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
