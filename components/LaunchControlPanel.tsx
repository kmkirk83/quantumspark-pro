"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardCard } from "@/components/DashboardCard";
import {
  calculateLaunchScore,
  countBySeverity,
  launchRecommendations,
  primaryLaunchFocus,
  type LaunchRecommendation,
  type LaunchSeverity,
} from "@/lib/launchReadiness";

type DetailTab = "plan" | "evidence" | "validation";
type CategoryFilter = LaunchRecommendation["category"] | "All";
type SeverityFilter = LaunchSeverity | "All";
type CompletedSteps = Record<string, number[]>;

const STORAGE_KEY = "quantumspark-launch-control";
const severityOptions: SeverityFilter[] = ["All", "Critical", "High", "Medium"];
const categoryOptions: CategoryFilter[] = [
  "All",
  "Reliability",
  "Security",
  "Performance",
  "User Experience",
];

function normalizeSteps(value: unknown): CompletedSteps {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([recommendationId, steps]) => [
      recommendationId,
      Array.isArray(steps)
        ? steps.filter((step): step is number => typeof step === "number")
        : [],
    ])
  );
}

function getCompletedIds(recommendations: LaunchRecommendation[], steps: CompletedSteps) {
  return recommendations
    .filter((recommendation) => {
      const completed = steps[recommendation.id] ?? [];
      return completed.length === recommendation.fixes.length;
    })
    .map((recommendation) => recommendation.id);
}

function getRecommendationStatus(
  recommendation: LaunchRecommendation,
  steps: CompletedSteps
) {
  const completed = steps[recommendation.id] ?? [];

  if (completed.length === recommendation.fixes.length) {
    return "Launch-ready";
  }

  if (completed.length > 0) {
    return "In progress";
  }

  return "Needs work";
}

function statusClasses(status: string) {
  if (status === "Launch-ready") {
    return "bg-emerald-500/20 text-emerald-300";
  }

  if (status === "In progress") {
    return "bg-sky-500/20 text-sky-300";
  }

  return "bg-amber-500/20 text-amber-300";
}

export function LaunchControlPanel() {
  const [selectedId, setSelectedId] = useState(launchRecommendations[0]?.id ?? "");
  const [detailTab, setDetailTab] = useState<DetailTab>("plan");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>({});
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as { completedSteps?: unknown };
      setCompletedSteps(normalizeSteps(parsed.completedSteps));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completedSteps })
    );
  }, [completedSteps]);

  const filteredRecommendations = useMemo(() => {
    return launchRecommendations.filter((recommendation) => {
      const matchesSeverity =
        severityFilter === "All" || recommendation.severity === severityFilter;
      const matchesCategory =
        categoryFilter === "All" || recommendation.category === categoryFilter;
      return matchesSeverity && matchesCategory;
    });
  }, [categoryFilter, severityFilter]);

  useEffect(() => {
    if (!filteredRecommendations.some((item) => item.id === selectedId)) {
      setSelectedId(filteredRecommendations[0]?.id ?? launchRecommendations[0]?.id ?? "");
    }
  }, [filteredRecommendations, selectedId]);

  const completedIds = useMemo(
    () => getCompletedIds(launchRecommendations, completedSteps),
    [completedSteps]
  );
  const severityCounts = useMemo(
    () => countBySeverity(launchRecommendations),
    []
  );
  const launchScore = useMemo(
    () => calculateLaunchScore(completedIds),
    [completedIds]
  );
  const primaryFocus = useMemo(
    () => primaryLaunchFocus(launchRecommendations, completedIds),
    [completedIds]
  );
  const selectedRecommendation =
    launchRecommendations.find((item) => item.id === selectedId) ??
    launchRecommendations[0];

  function toggleFixStep(recommendationId: string, stepIndex: number) {
    setCompletedSteps((current) => {
      const activeSteps = current[recommendationId] ?? [];
      const nextSteps = activeSteps.includes(stepIndex)
        ? activeSteps.filter((value) => value !== stepIndex)
        : [...activeSteps, stepIndex].sort((left, right) => left - right);

      return {
        ...current,
        [recommendationId]: nextSteps,
      };
    });
  }

  function markAll(recommendation: LaunchRecommendation) {
    setCompletedSteps((current) => ({
      ...current,
      [recommendation.id]: recommendation.fixes.map((_, index) => index),
    }));
  }

  function resetRecommendation(recommendationId: string) {
    setCompletedSteps((current) => ({
      ...current,
      [recommendationId]: [],
    }));
  }

  async function copyCommand(command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand(null), 1500);
    } catch {
      setCopiedCommand(null);
    }
  }

  if (!selectedRecommendation) {
    return null;
  }

  const recommendationStatus = getRecommendationStatus(
    selectedRecommendation,
    completedSteps
  );
  const completedFixCount = (completedSteps[selectedRecommendation.id] ?? []).length;

  return (
    <section className="mt-10 space-y-6">
      <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 shadow-xl">
        <div className="flex flex-col gap-4 border-b border-gray-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-purple-400">
              Launch control
            </p>
            <h2 className="mt-3 text-3xl font-bold">Market readiness workspace</h2>
            <p className="mt-3 max-w-3xl text-sm text-gray-400">
              Review the highest-impact fixes for this repository, track what you
              have completed in the browser, and use the validation commands
              attached to each launch blocker.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-950/80 px-4 py-3 text-sm text-gray-300">
            <p className="font-semibold text-white">Current blockers chosen from repo audit</p>
            <p className="mt-1">
              {launchRecommendations.length} recommendations •{" "}
              {completedIds.length} complete
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <DashboardCard
            title="Launch score"
            value={`${launchScore}%`}
            status={launchScore >= 70 ? "Healthy" : "Needs attention"}
          />
          <DashboardCard
            title="Critical blockers"
            value={`${severityCounts.Critical}`}
            status="Immediate"
          />
          <DashboardCard
            title="Primary focus"
            value={primaryFocus}
            status="Next fix"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <section className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 shadow-xl">
          <div className="flex flex-col gap-5 border-b border-gray-800 pb-6">
            <div>
              <h3 className="text-2xl font-semibold">Launch blockers</h3>
              <p className="mt-2 text-sm text-gray-400">
                Filter the recommendations and open a guided fix plan for each
                market-readiness gap.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {severityOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSeverityFilter(option)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                      severityFilter === option
                        ? "border-purple-400 bg-purple-500/20 text-purple-200"
                        : "border-gray-700 bg-gray-950/70 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCategoryFilter(option)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                      categoryFilter === option
                        ? "border-sky-400 bg-sky-500/20 text-sky-200"
                        : "border-gray-700 bg-gray-950/70 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredRecommendations.map((recommendation) => {
              const status = getRecommendationStatus(recommendation, completedSteps);
              const isSelected = recommendation.id === selectedRecommendation.id;
              const stepCount = (completedSteps[recommendation.id] ?? []).length;

              return (
                <article
                  key={recommendation.id}
                  className={`rounded-2xl border p-5 transition ${
                    isSelected
                      ? "border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-950/40"
                      : "border-gray-700 bg-gray-800/70"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-gray-950/80 px-2.5 py-1 text-xs font-semibold text-gray-300">
                          {recommendation.category}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            recommendation.severity === "Critical"
                              ? "bg-rose-500/20 text-rose-300"
                              : recommendation.severity === "High"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-sky-500/20 text-sky-300"
                          }`}
                        >
                          {recommendation.severity}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-white">
                          {recommendation.title}
                        </h4>
                        <p className="mt-2 text-sm text-gray-400">
                          {recommendation.summary}
                        </p>
                      </div>
                      <p className="text-sm text-gray-300">
                        Fix progress: {stepCount}/{recommendation.fixes.length}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(recommendation.id);
                          setDetailTab("plan");
                        }}
                        className="rounded-full border border-purple-400 px-4 py-2 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20"
                      >
                        Open fix plan
                      </button>
                      {recommendation.actionHref ? (
                        <a
                          href={recommendation.actionHref}
                          className="rounded-full border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-gray-400"
                        >
                          {recommendation.actionLabel}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredRecommendations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-950/60 p-6 text-sm text-gray-400">
                No blockers match this filter yet.
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 shadow-xl">
          <div className="flex flex-col gap-4 border-b border-gray-800 pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-purple-400">
                  Guided fix
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {selectedRecommendation.title}
                </h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                  recommendationStatus
                )}`}
              >
                {recommendationStatus}
              </span>
            </div>

            <p className="text-sm text-gray-300">
              {selectedRecommendation.businessImpact}
            </p>

            <div className="flex flex-wrap gap-2">
              {(["plan", "evidence", "validation"] as DetailTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDetailTab(tab)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold capitalize transition ${
                    detailTab === tab
                      ? "border-purple-400 bg-purple-500/20 text-purple-200"
                      : "border-gray-700 bg-gray-950/70 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {detailTab === "plan" ? (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => markAll(selectedRecommendation)}
                  className="rounded-full border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
                >
                  Mark all complete
                </button>
                <button
                  type="button"
                  onClick={() => resetRecommendation(selectedRecommendation.id)}
                  className="rounded-full border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-gray-400"
                >
                  Reset checklist
                </button>
              </div>

              <ol className="space-y-3">
                {selectedRecommendation.fixes.map((fix, index) => {
                  const checked = (completedSteps[selectedRecommendation.id] ?? []).includes(
                    index
                  );

                  return (
                    <li
                      key={`${selectedRecommendation.id}-${index}`}
                      className="rounded-2xl border border-gray-700 bg-gray-800/70 p-4"
                    >
                      <label className="flex cursor-pointer gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleFixStep(selectedRecommendation.id, index)
                          }
                          className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-950 text-purple-500 focus:ring-purple-500"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-white">
                            Step {index + 1}
                          </span>
                          <span className="mt-1 block text-sm text-gray-300">
                            {fix}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ol>

              <div className="rounded-2xl border border-gray-700 bg-gray-950/60 p-4 text-sm text-gray-300">
                Completed steps: {completedFixCount}/{selectedRecommendation.fixes.length}
              </div>
            </div>
          ) : null}

          {detailTab === "evidence" ? (
            <div className="mt-6 space-y-3">
              {selectedRecommendation.evidence.map((item) => (
                <div
                  key={`${item.path}:${item.lines}`}
                  className="rounded-2xl border border-gray-700 bg-gray-800/70 p-4"
                >
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-2 break-all text-sm text-gray-300">{item.path}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">
                    Lines {item.lines}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {detailTab === "validation" ? (
            <div className="mt-6 space-y-3">
              {selectedRecommendation.validation.map((command) => (
                <div
                  key={command}
                  className="rounded-2xl border border-gray-700 bg-gray-800/70 p-4"
                >
                  <p className="font-mono text-sm text-gray-200">{command}</p>
                  <button
                    type="button"
                    onClick={() => copyCommand(command)}
                    className="mt-3 rounded-full border border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:border-gray-400"
                  >
                    {copiedCommand === command ? "Copied" : "Copy command"}
                  </button>
                </div>
              ))}
              {selectedRecommendation.actionHref ? (
                <a
                  href={selectedRecommendation.actionHref}
                  className="inline-flex rounded-full border border-purple-400 px-4 py-2 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20"
                >
                  {selectedRecommendation.actionLabel}
                </a>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
