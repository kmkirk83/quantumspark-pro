interface DashboardCardProps {
  title: string;
  value: string;
  status?: "Healthy" | "Needs attention" | "Tracking" | string;
}

const STATUS_CLASSES: Record<string, string> = {
  Healthy: "text-emerald-400",
  "Needs attention": "text-amber-400",
};

export function DashboardCard({
  title,
  value,
  status = "Tracking",
}: DashboardCardProps) {
  const statusClass = STATUS_CLASSES[status] ?? "text-sky-400";

  return (
    <article className="rounded-[28px] border border-white/10 bg-slate-950/35 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.3)]">
      <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-4xl font-bold text-white">{value}</p>
        <p className={`text-sm font-semibold ${statusClass}`}>{status}</p>
      </div>
    </article>
  );
}
