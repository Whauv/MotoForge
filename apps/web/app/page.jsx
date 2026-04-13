import BikeCatalog from "../components/home/BikeCatalog";

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
      <section className="border-b border-zinc-800 bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">
            3D Motorcycle Configurator
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-white md:text-7xl">
            MotoForge
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-zinc-300 md:text-xl">
            Visualize your build before you build it. Pick the make, model, year,
            and ownership state, then explore only the modifications that fit your bike.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <BikeCatalog motorcycles={motorcycles} />
      </section>
    </main>
  );
}
