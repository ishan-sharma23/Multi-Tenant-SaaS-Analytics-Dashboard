import clsx from "clsx";

interface KpiCardProps {
  title: string;
  value: string;
  changePct: number;
}

export default function KpiCard({ title, value, changePct }: KpiCardProps): JSX.Element {
  const positive = changePct >= 0;

  return (
    <article className="rounded-2xl border border-white/50 bg-white/80 p-5 shadow-panel backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-ink">{value}</p>
      <p
        className={clsx("mt-2 text-sm font-semibold", {
          "text-ocean": positive,
          "text-berry": !positive,
        })}
      >
        {positive ? "+" : ""}
        {changePct.toFixed(2)}%
      </p>
    </article>
  );
}
