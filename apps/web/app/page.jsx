import Link from "next/link";

import DemoBuild from "../components/landing/DemoBuild";
import SiteHeader from "../components/ui/SiteHeader";

const REPO_URL = "https://github.com/Whauv/MotoForge";

const steps = [
  {
    title: "Choose your bike",
    body: "Start from the bike you own or the one you're about to buy. Tick “I already own the bike” and its price stays out of the quote.",
  },
  {
    title: "Fit parts and watch the numbers",
    body: "Only parts that fit that bike are listed. Each one shows up on the 3D model, with the change in power, weight and price as you add it.",
  },
  {
    title: "Take the quote to the workshop",
    body: "Download an itemised PDF, or copy the build link so a mechanic or a friend sees exactly the same build.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="hidden text-sm font-medium text-graphite-soft hover:text-graphite sm:inline">
          Source on GitHub
        </a>
        <Link href="/product" className="rounded-panel bg-anodized px-4 py-2 text-sm font-semibold text-white hover:bg-anodized-deep">
          Choose a bike
        </Link>
      </SiteHeader>

      <main>
        <section className="mx-auto max-w-[1600px] px-5 pb-10 pt-14 md:px-8 md:pt-20">
          <h1 className="stretch-expanded max-w-5xl text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
            Build the motorcycle before you build it in the workshop.
          </h1>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-xl text-lg text-graphite-soft">
              See compatible parts on your bike in 3D, with what each one does to power, weight and
              price, before you order anything.
            </p>
            <Link
              href="/product"
              className="self-start rounded-panel bg-anodized px-5 py-3 font-semibold text-white hover:bg-anodized-deep md:self-auto"
            >
              Choose a bike
            </Link>
          </div>
        </section>

        <section aria-label="Sample build" className="mx-auto max-w-[1600px] md:px-8">
          <DemoBuild />
        </section>

        <section aria-labelledby="steps-heading" className="mx-auto max-w-[1600px] px-5 py-20 md:px-8 md:py-28">
          <h2 id="steps-heading" className="stretch-semi-expanded text-3xl font-extrabold">
            From stock bike to quote
          </h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t border-graphite pt-5">
                <span className="stretch-expanded text-4xl font-black text-steel">{index + 1}</span>
                <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 max-w-sm text-graphite-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="fit-heading" className="bg-graphite text-bench">
          <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-20 md:grid-cols-2 md:px-8 md:py-24">
            <h2 id="fit-heading" className="stretch-semi-expanded max-w-md text-3xl font-extrabold">
              If a part doesn&apos;t fit your bike, you won&apos;t see it.
            </h2>
            <div className="max-w-lg space-y-4 text-lg text-bench/80">
              <p>
                Every part is linked to the bikes it fits, by riding segment, so a cruiser never
                gets offered a sportbike&apos;s clip-ons.
              </p>
              <p>
                Quotes are worked out by the MotoForge API from the same fitment data, so the price
                you see is the price on the PDF.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="run-heading" className="mx-auto max-w-[1600px] px-5 py-20 md:px-8">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 id="run-heading" className="stretch-semi-expanded text-3xl font-extrabold">
                Run it on your machine
              </h2>
              <p className="mt-4 max-w-md text-graphite-soft">
                MotoForge is open source: a FastAPI service for bikes, parts and quotes, and this
                Next.js app with a React Three Fiber viewer.
              </p>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="mt-6 inline-block font-semibold text-anodized-deep underline underline-offset-4">
                Read the setup guide on GitHub
              </a>
            </div>
            <pre className="overflow-x-auto rounded-panel bg-bench-sunk p-5 text-sm leading-7">
              <code>{`# API, from apps/api
pip install -r requirements.txt
python seed/seed.py
uvicorn app.main:app --reload

# Web, from apps/web
npm ci
npm run dev`}</code>
            </pre>
          </div>
        </section>
      </main>

      <footer className="border-t border-steel/60">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-graphite-soft md:px-8">
          <span className="stretch-expanded font-black text-graphite">MotoForge</span>
          <span>For riders, builders and workshops.</span>
        </div>
      </footer>
    </>
  );
}
