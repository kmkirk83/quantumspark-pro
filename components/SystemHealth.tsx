<<<<<<< HEAD
import { DashboardCard } from "./DashboardCard";
import { calculateScore, primaryFocusCategory } from "@/lib/scoring";
import type { ReadinessCheck } from "@/lib/scoring";

interface SystemHealthProps {
  checks: ReadinessCheck[];
=======
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { calculateScore, type Check } from "../lib/scoring";

export interface SystemHealthProps {
  checks: Check[];
>>>>>>> origin/main
}

export function SystemHealth({ checks }: SystemHealthProps) {
  const score = calculateScore(checks);
  const completed = checks.filter((c) => c.complete).length;
<<<<<<< HEAD
  const focus = primaryFocusCategory(checks);
=======
  const pending = checks.length - completed;
  const overallStatus = score >= 70 ? "Healthy" : "Needs attention";
>>>>>>> origin/main

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <DashboardCard
        title="Readiness score"
        value={`${score}%`}
<<<<<<< HEAD
        status={score >= 70 ? "Healthy" : "Needs attention"}
=======
        status={overallStatus}
>>>>>>> origin/main
      />
      <DashboardCard
        title="Completed checks"
        value={`${completed}/${checks.length}`}
<<<<<<< HEAD
        status="Foundation ready"
      />
      <DashboardCard
        title="Primary focus"
        value={focus}
        status="Next investment"
=======
        status="Tracking"
      />
      <DashboardCard
        title="Pending checks"
        value={String(pending)}
        status={pending === 0 ? "Healthy" : "Needs attention"}
>>>>>>> origin/main
      />
    </section>
  );
}
