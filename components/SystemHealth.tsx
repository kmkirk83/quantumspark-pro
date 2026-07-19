import React from "react";
import { DashboardCard } from "./DashboardCard";
import { calculateScore, type Check } from "../lib/scoring";

export interface SystemHealthProps {
  checks: Check[];
}

export function SystemHealth({ checks }: SystemHealthProps) {
  const score = calculateScore(checks);
  const completed = checks.filter((c) => c.complete).length;
  const pending = checks.length - completed;
  const overallStatus = score >= 70 ? "Healthy" : "Needs attention";

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <DashboardCard
        title="Readiness score"
        value={`${score}%`}
        status={overallStatus}
      />
      <DashboardCard
        title="Completed checks"
        value={`${completed}/${checks.length}`}
        status="Tracking"
      />
      <DashboardCard
        title="Pending checks"
        value={String(pending)}
        status={pending === 0 ? "Healthy" : "Needs attention"}
      />
    </section>
  );
}
