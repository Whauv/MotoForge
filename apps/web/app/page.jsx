import Link from "next/link";

const installationSteps = [
  "Clone the MotoForge repository from GitHub.",
  "Install the API dependencies and start the FastAPI server.",
  "Install the web dependencies and run the Next.js app.",
  "Seed the local database, then launch the configurator.",
];

const featureCards = [
  {
    title: "3D Motorcycle Configurator",
    body:
      "Explore a bike in a live 360-degree viewer, swap compatible parts, and evaluate each build before touching hardware.",
  },
  {
    title: "Compatibility-Aware Parts",
    body:
      "MotoForge only surfaces modification options that match the imported bike and segment rules in the backend catalog.",
  },
  {
    title: "Live Quote and Performance",
    body:
      "Every build updates pricing, horsepower, and weight projections in real time so riders and workshops can make fast decisions.",
  },
];

const technicalHighlights = [
  "Next.js 14 frontend with React Three Fiber for the visual experience",
  "FastAPI backend with SQLAlchemy services for quotes, fitment, and imports",
  "Asset manifest and validator for production GLB bike and part models",
  "Docker, CI/CD, and deployment scaffolding for cloud rollout",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-400">
              MotoForge
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              3D motorcycle configuration platform for riders, builders, and shops
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="https://github.com/Whauv/MotoForge"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-orange-400 hover:text-white"
            >
              View GitHub
            </Link>
            <Link
              href="/product"
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              Launch Product
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">
                Product Overview
              </p>
              <h1 className="mt-5 text-5xl font-black tracking-tight text-white md:text-7xl">
                Build the motorcycle before you build it in the workshop.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300 md:text-xl">
                MotoForge helps riders and custom shops choose a bike, preview
                compatible modifications in 3D, and export a real quote before
                buying parts or starting fabrication.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/product"
                className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Open the Configurator
              </Link>
              <Link
                href="https://github.com/Whauv/MotoForge"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-orange-400 hover:text-white"
              >
                Explore the Repository
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6"
                >
                  <h2 className="text-xl font-bold text-white">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{card.body}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[32px] border border-zinc-800 bg-zinc-900/70 p-6">
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                What You Can Do
              </p>
              <div className="mt-5 space-y-5">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <p className="text-sm font-semibold text-white">Choose a bike</p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Browse the imported catalog or request a live-catalog model.
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <p className="text-sm font-semibold text-white">Preview modifications</p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Compare exhausts, suspension, wheels, fairings, and handlebar
                    setups in the 3D viewer.
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <p className="text-sm font-semibold text-white">Export the build</p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Review pricing and performance, then generate a clean PDF quote.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-zinc-800 px-6 py-18">
        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-2">
          <div className="rounded-[32px] border border-zinc-800 bg-zinc-900/60 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
              Installation
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white">
              Run MotoForge locally
            </h2>
            <ol className="mt-6 space-y-4 text-sm text-zinc-300">
              {installationSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="leading-7">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 font-mono text-xs leading-7 text-zinc-300">
              <p>apps/api: `python seed/seed.py && uvicorn app.main:app --reload`</p>
              <p>apps/web: `npm install && npm run dev`</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-zinc-800 bg-zinc-900/60 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
              Technical Snapshot
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white">
              Built for configuration and expansion
            </h2>
            <div className="mt-6 space-y-4">
              {technicalHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-4 text-sm leading-7 text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
