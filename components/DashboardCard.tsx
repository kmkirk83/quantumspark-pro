<<<<<<< HEAD
interface DashboardCardProps {
  title: string;
  value: string;
  status?: "Healthy" | "Needs attention" | "Tracking" | string;
}

const STATUS_CLASSES: Record<string, string> = {
  Healthy: "text-emerald-400",
  "Needs attention": "text-amber-400",
};

=======
import React from "react";

export interface DashboardCardProps {
  title: string;
  value: string;
  status?: "Healthy" | "Needs attention" | "Tracking";
}

>>>>>>> origin/main
export function DashboardCard({
  title,
  value,
  status = "Tracking",
}: DashboardCardProps) {
<<<<<<< HEAD
  const statusClass = STATUS_CLASSES[status] ?? "text-sky-400";

  return (
    <article className="rounded-2xl border border-gray-700 bg-gray-800/90 p-6 shadow-lg">
      <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
        {title}
      </p>
=======
  const statusClass =
    status === "Healthy"
      ? "text-emerald-400"
      : status === "Needs attention"
        ? "text-amber-400"
        : "text-sky-400";

  return (
    <article className="rounded-2xl border border-gray-700 bg-gray-800/90 p-6 shadow-lg">
      <p className="text-sm uppercase tracking-[0.2em] text-gray-400">{title}</p>
>>>>>>> origin/main
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-4xl font-bold text-white">{value}</p>
        <p className={`text-sm font-semibold ${statusClass}`}>{status}</p>
      </div>
    </article>
  );
}
