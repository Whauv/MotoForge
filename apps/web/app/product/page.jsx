import Link from "next/link";

import BikeCatalog from "../../components/home/BikeCatalog";
import SiteHeader from "../../components/ui/SiteHeader";

export const metadata = {
  title: "Choose a bike | MotoForge",
};

async function getMotorcycles() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const response = await fetch(`${baseUrl}/api/motorcycles`, { cache: "no-store" });
    if (!response.ok) {
      return { motorcycles: [], error: `The API answered with status ${response.status}.` };
    }
    return { motorcycles: await response.json(), error: null };
  } catch {
    return { motorcycles: [], error: `The API at ${baseUrl} isn't reachable.` };
  }
}

export default async function ProductPage() {
  const { motorcycles, error } = await getMotorcycles();

  return (
    <>
      <SiteHeader>
        <Link href="/" className="text-sm font-medium text-graphite-soft hover:text-graphite">
          How it works
        </Link>
      </SiteHeader>
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-12 md:px-8 md:pt-16">
        <h1 className="stretch-expanded max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
          Choose the bike you&apos;re building
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-graphite-soft">
          Next you&apos;ll see every part that fits it, in 3D, with the price and performance change
          for each one.
        </p>

        <div className="mt-12">
          {error ? (
            <div className="max-w-xl border-l-[3px] border-graphite py-1 pl-4">
              <h2 className="font-semibold">The bike list didn&apos;t load</h2>
              <p className="mt-1 text-graphite-soft">
                {error} Start it with <code className="text-graphite">uvicorn app.main:app</code> in{" "}
                <code className="text-graphite">apps/api</code>, then reload this page.
              </p>
            </div>
          ) : (
            <BikeCatalog motorcycles={motorcycles} />
          )}
        </div>
      </main>
    </>
  );
}
