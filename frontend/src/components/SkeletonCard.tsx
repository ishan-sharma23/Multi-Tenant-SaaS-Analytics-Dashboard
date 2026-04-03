export default function SkeletonCard(): JSX.Element {
  return (
    <div className="animate-pulse rounded-2xl border border-white/50 bg-white/70 p-5 shadow-panel">
      <div className="h-3 w-24 rounded bg-slate-200" />
      <div className="mt-4 h-8 w-28 rounded bg-slate-300" />
      <div className="mt-2 h-4 w-20 rounded bg-slate-200" />
    </div>
  );
}
