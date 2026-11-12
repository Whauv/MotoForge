import Link from "next/link";

export default function SiteHeader({ children }) {
  return (
    <header className="border-b border-steel/60 bg-bench">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-5 md:px-8">
        <Link href="/" className="stretch-expanded text-lg font-black tracking-tight">
          MotoForge
        </Link>
        <div className="flex min-w-0 items-center gap-3 md:gap-6">{children}</div>
      </div>
    </header>
  );
}
