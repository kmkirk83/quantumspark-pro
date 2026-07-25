import {
  filterRecommendations,
  getTopRecommendation,
  REPO_TARGET_LABELS,
  type AgentFocus,
  type AgentRecommendation,
  type RepoTarget,
} from "@/lib/agentRecommendations";
import type { ScanResult } from "@/lib/githubScanner";

const DEFAULT_TARGETS: RepoTarget[] = ["whole-repo"];
const VALID_TARGETS: RepoTarget[] = ["whole-repo", "frontend", "backend", "app"];
const VALID_FOCUSES: AgentFocus[] = [
  "all",
  "quality",
  "security",
  "release",
  "operations",
  "growth",
  "planning",
];

export interface RepositorySnapshot {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  openIssues: number;
  ciPassing: boolean;
  latestWorkflowUrl: string | null;
  updatedAt: string;
}

export interface RecommendationResult {
  target: RepoTarget;
  targetLabel: string;
  topRecommendation: AgentRecommendation;
  recommendations: AgentRecommendation[];
}

export interface RecommendationPayload {
  focus: AgentFocus;
  targets: RepoTarget[];
  generatedAt: string;
  repository: RepositorySnapshot | null;
  recommendations: RecommendationResult[];
}

function dedupeTargets(targets: RepoTarget[]): RepoTarget[] {
  return targets.filter((target, index) => targets.indexOf(target) === index);
}

export function parseFocus(value: string | null): AgentFocus {
  return VALID_FOCUSES.includes(value as AgentFocus)
    ? (value as AgentFocus)
    : "all";
}

export function parseTargets(value: string | null): RepoTarget[] {
  if (!value) {
    return DEFAULT_TARGETS;
  }

  const parsedTargets = dedupeTargets(
    value
    .split(",")
    .map((target) => target.trim())
    .filter((target): target is RepoTarget =>
      VALID_TARGETS.includes(target as RepoTarget)
    )
  );

  const orderedTargets = VALID_TARGETS.filter((target) =>
    parsedTargets.includes(target)
  );

  return orderedTargets.length > 0 ? orderedTargets : DEFAULT_TARGETS;
}

export function buildRepositorySnapshot(
  owner: string,
  repo: string,
  scanResult: ScanResult
): RepositorySnapshot {
  return {
    owner,
    repo,
    fullName: scanResult.repo.full_name,
    description: scanResult.repo.description,
    defaultBranch: scanResult.repo.default_branch,
    openIssues: scanResult.openIssues,
    ciPassing: scanResult.ciPassing,
    latestWorkflowUrl: scanResult.latestRun?.html_url ?? null,
    updatedAt: scanResult.repo.updated_at,
  };
}

export function buildRecommendationPayload(options: {
  focus: AgentFocus;
  targets: RepoTarget[];
  repository?: RepositorySnapshot | null;
}): RecommendationPayload {
  const recommendations = options.targets.map((target) => {
    const matches = filterRecommendations(target, options.focus);

    return {
      target,
      targetLabel: REPO_TARGET_LABELS[target],
      topRecommendation: matches[0] ?? getTopRecommendation(target),
      recommendations: matches,
    };
  });

  return {
    focus: options.focus,
    targets: options.targets,
    generatedAt: new Date().toISOString(),
    repository: options.repository ?? null,
    recommendations,
  };
}
