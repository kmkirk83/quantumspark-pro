"use client";

import { useMemo, useState } from "react";
import {
  AGENT_RECOMMENDATIONS,
  REPO_TARGET_DESCRIPTIONS,
  REPO_TARGET_LABELS,
  filterRecommendations,
  getTopRecommendation,
  type AgentFocus,
  type RepoTarget,
} from "@/lib/agentRecommendations";

const TARGETS: RepoTarget[] = ["whole-repo", "frontend", "backend", "app"];
const FOCUSES: { value: AgentFocus; label: string }[] = [
  { value: "all", label: "All priorities" },
  { value: "quality", label: "Quality" },
  { value: "security", label: "Security" },
  { value: "release", label: "Release" },
  { value: "operations", label: "Operations" },
  { value: "growth", label: "Growth" },
  { value: "planning", label: "Planning" },
];

export function AgentLaunchpad() {
  const [target, setTarget] = useState<RepoTarget>("whole-repo");
  const [focus, setFocus] = useState<AgentFocus>("all");

  const recommendations = useMemo(
    () => filterRecommendations(target, focus),
    [focus, target]
  );
  const topRecommendation = useMemo(() => getTopRecommendation(target), [target]);

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 shadow-xl">
      <div className="flex flex-col gap-6 border-b border-gray-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Agent launchpad
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Pick a repo area and launch the best-fit tool
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-400">
            Use the filters to see which agent apps fit each part of QuantumSpark
            Pro, then open the vendor page to install or evaluate that tool.
          </p>
        </div>

        <a
          href={topRecommendation.launchUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-cyan-300"
        >
          Launch top pick for {REPO_TARGET_LABELS[target]}
        </a>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr,2fr]">
        <aside className="rounded-2xl border border-gray-800 bg-gray-950/70 p-5">
          <h3 className="text-lg font-semibold">Target selector</h3>
          <p className="mt-2 text-sm text-gray-400">
            Choose the repo surface you want to improve first.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {TARGETS.map((candidate) => {
              const selected = candidate === target;
              return (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => setTarget(candidate)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-cyan-400 bg-cyan-400/10 text-white"
                      : "border-gray-800 bg-gray-900/70 text-gray-200 hover:border-gray-700 hover:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">
                      {REPO_TARGET_LABELS[candidate]}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      {candidate}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    {REPO_TARGET_DESCRIPTIONS[candidate]}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <label htmlFor="focus" className="text-sm font-semibold text-white">
              Priority filter
            </label>
            <select
              id="focus"
              value={focus}
              onChange={(event) => setFocus(event.target.value as AgentFocus)}
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400"
            >
              {FOCUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
              Recommended first
            </p>
            <p className="mt-2 text-xl font-semibold text-white">
              #{topRecommendation.rank} {topRecommendation.name}
            </p>
            <p className="mt-2 text-sm text-gray-300">{topRecommendation.bestFor}</p>
          </div>
        </aside>

        <div>
          <div className="grid gap-4 md:grid-cols-2">
            {TARGETS.map((candidate) => {
              const top = getTopRecommendation(candidate);
              return (
                <article
                  key={candidate}
                  className={`rounded-2xl border p-4 ${
                    candidate === target
                      ? "border-purple-400 bg-purple-500/10"
                      : "border-gray-800 bg-gray-950/60"
                  }`}
                >
                  <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
                    {REPO_TARGET_LABELS[candidate]}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-white">{top.name}</p>
                  <p className="mt-1 text-sm text-gray-300">{top.bestFor}</p>
                  <p className="mt-3 text-xs text-gray-400">Fit score {top.score}/100</p>
                </article>
              );
            })}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60">
            {recommendations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead className="bg-gray-950/90">
                    <tr className="border-b border-gray-800 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                      <th scope="col" className="px-4 py-3">
                        Agent
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Rank
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Fit
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Launch
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendations.map((recommendation) => (
                      <tr
                        key={recommendation.name}
                        className="border-t border-gray-800 align-top"
                      >
                        <td className="px-4 py-4">
                          <p className="text-lg font-semibold text-white">
                            {recommendation.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-300">
                            {recommendation.summary}
                          </p>
                          <p className="mt-2 text-xs text-cyan-300">
                            {recommendation.repoNotes[target]}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300">
                          {recommendation.rank}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xl font-bold text-white">
                            {recommendation.score}
                          </p>
                          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                            {recommendation.focus}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2">
                            <a
                              href={recommendation.launchUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-full border border-cyan-400 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
                            >
                              Open {recommendation.name}
                            </a>
                            <p className="text-xs text-gray-500">
                              {recommendation.bestFor}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-6 text-sm text-gray-400">
                No tools match that priority for {REPO_TARGET_LABELS[target]} yet.
                Try a different filter to see more options.
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
            <h3 className="text-lg font-semibold text-white">Ranking reference</h3>
            <p className="mt-2 text-sm text-gray-400">
              Ordered from best to worst fit for QuantumSpark Pro right now.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {AGENT_RECOMMENDATIONS.map((recommendation) => (
                <span
                  key={recommendation.name}
                  className="rounded-full border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200"
                >
                  #{recommendation.rank} {recommendation.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
