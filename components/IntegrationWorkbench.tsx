"use client";

import { useMemo, useState } from "react";

import {
  REPO_TARGET_LABELS,
  type AgentFocus,
  type RepoTarget,
} from "@/lib/agentRecommendations";
import type { RecommendationPayload } from "@/lib/recommendationService";

const TARGETS: RepoTarget[] = ["whole-repo", "frontend", "backend", "app"];
const FOCUS_OPTIONS: { value: AgentFocus; label: string }[] = [
  { value: "all", label: "All priorities" },
  { value: "quality", label: "Quality" },
  { value: "security", label: "Security" },
  { value: "release", label: "Release" },
  { value: "operations", label: "Operations" },
  { value: "growth", label: "Growth" },
  { value: "planning", label: "Planning" },
];

function buildApiUrl(owner: string, repo: string, focus: AgentFocus, targets: RepoTarget[]) {
  const params = new URLSearchParams({
    focus,
    targets: targets.join(","),
  });

  if (owner && repo) {
    params.set("owner", owner);
    params.set("repo", repo);
  }

  return `/api/agent-recommendations?${params.toString()}`;
}

export function IntegrationWorkbench() {
  const [owner, setOwner] = useState("kmkirk83");
  const [repo, setRepo] = useState("quantumspark-pro");
  const [focus, setFocus] = useState<AgentFocus>("all");
  const [targets, setTargets] = useState<RepoTarget[]>(["whole-repo"]);
  const [payload, setPayload] = useState<RecommendationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = useMemo(
    () => buildApiUrl(owner.trim(), repo.trim(), focus, targets),
    [focus, owner, repo, targets]
  );

  function toggleTarget(target: RepoTarget) {
    setTargets((currentTargets) => {
      const nextTargets = currentTargets.includes(target)
        ? currentTargets.filter((candidate) => candidate !== target)
        : [...currentTargets, target];

      return nextTargets.length > 0 ? nextTargets : ["whole-repo"];
    });
  }

  async function handleAnalyze() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl);
      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody.error ?? "Unable to load recommendations");
      }

      setPayload(responseBody as RecommendationPayload);
    } catch (requestError) {
      setPayload(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load recommendations"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 shadow-xl">
      <div className="border-b border-gray-800 pb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
          Reusable integration
        </p>
        <h2 className="mt-3 text-2xl font-semibold">
          Use this as a repo recommendation API for other teams
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-400">
          This project now exposes a reusable GitHub-friendly endpoint that any
          repo owner can call with an owner, repo, target surface, and priority
          to get the same ranked agent recommendations.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr,2fr]">
        <aside className="rounded-2xl border border-gray-800 bg-gray-950/70 p-5">
          <h3 className="text-lg font-semibold text-white">Integration setup</h3>
          <p className="mt-2 text-sm text-gray-400">
            Fill in a repo and target surfaces, then call the API.
          </p>

          <div className="mt-4 grid gap-4">
            <div>
              <label className="text-sm font-semibold text-white" htmlFor="owner">
                GitHub owner
              </label>
              <input
                id="owner"
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-white" htmlFor="repo">
                Repository name
              </label>
              <input
                id="repo"
                value={repo}
                onChange={(event) => setRepo(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-white" htmlFor="integration-focus">
                Priority
              </label>
              <select
                id="integration-focus"
                value={focus}
                onChange={(event) => setFocus(event.target.value as AgentFocus)}
                className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
              >
                {FOCUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-white">Repo targets</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TARGETS.map((target) => {
                const active = targets.includes(target);
                return (
                  <button
                    key={target}
                    type="button"
                    onClick={() => toggleTarget(target)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                        : "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    {REPO_TARGET_LABELS[target]}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Analyzing repo..." : "Run integration"}
          </button>

          <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              API endpoint
            </p>
            <code className="mt-2 block break-all text-sm text-emerald-300">
              {apiUrl}
            </code>
          </div>
        </aside>

        <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
          <h3 className="text-lg font-semibold text-white">Integration output</h3>
          <p className="mt-2 text-sm text-gray-400">
            The JSON below can be consumed by GitHub Actions, bots, or internal tooling.
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {payload ? (
            <>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {payload.recommendations.map((recommendation) => (
                  <article
                    key={recommendation.target}
                    className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4"
                  >
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
                      {recommendation.targetLabel}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-white">
                      {recommendation.topRecommendation.name}
                    </p>
                    <p className="mt-2 text-sm text-gray-300">
                      {recommendation.topRecommendation.bestFor}
                    </p>
                  </article>
                ))}
              </div>

              <pre className="mt-6 overflow-x-auto rounded-2xl border border-gray-800 bg-black/30 p-4 text-xs text-gray-200">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-700 px-4 py-8 text-sm text-gray-400">
              Run the integration to generate a reusable recommendation payload.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
