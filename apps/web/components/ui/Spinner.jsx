export default function Spinner({ label = "Loading" }) {
  return (
    <div role="status" className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <span aria-hidden className="h-8 w-8 animate-spin rounded-full border-2 border-steel border-t-anodized motion-reduce:animate-none" />
      <span className="text-sm text-graphite-soft">{label}</span>
    </div>
  );
}
