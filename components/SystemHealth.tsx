import { DashboardCard } from "./DashboardCard";
import { calculateScore, primaryFocusCategory } from "@/lib/scoring";
import type { ReadinessCheck } from "@/lib/scoring";

interface SystemHealthProps {
  checks: ReadinessCheck[];
}

export function SystemHealth({ checks }: SystemHealthProps) {
  const score = calculateScore(checks);
  const completed = checks.filter((c) => c.complete).length;
  const focus = primaryFocusCategory(checks);

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <DashboardCard
        title="Readiness score"
        value={`${score}%`}
        status={score >= 70 ? "Healthy" : "Needs attention"}
      />
      <DashboardCard
        title="Completed checks"
        value={`${completed}/${checks.length}`}
        status="Foundation ready"
      />
      <DashboardCard
        title="Primary focus"
        value={focus}
        status="Next investment"
      />
    </section>
  );
}
