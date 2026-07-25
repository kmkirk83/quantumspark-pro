export type RepoTarget = "whole-repo" | "frontend" | "backend" | "app";
export type AgentFocus =
  | "all"
  | "quality"
  | "security"
  | "release"
  | "operations"
  | "growth"
  | "planning";

export interface AgentRecommendation {
  name: string;
  rank: number;
  score: number;
  focus: Exclude<AgentFocus, "all">;
  bestFor: string;
  summary: string;
  launchUrl: string;
  repoTargets: RepoTarget[];
  repoNotes: Partial<Record<RepoTarget, string>>;
}

export const REPO_TARGET_LABELS: Record<RepoTarget, string> = {
  "whole-repo": "Whole repo",
  frontend: "/frontend",
  backend: "/backend",
  app: "/app",
};
const REPO_TARGET_ORDER: RepoTarget[] = ["whole-repo", "frontend", "backend", "app"];

function orderTargets(...targets: RepoTarget[]): RepoTarget[] {
  return REPO_TARGET_ORDER.filter((target) => targets.includes(target));
}

const FIT_SCORES = {
  bestInClass: 95,
  excellent: 90,
  veryStrong: 85,
  strong: 80,
  solid: 70,
  situational: 65,
  growthStage: 60,
  lowerPriority: 45,
  migrationOnly: 40,
} as const;

export const REPO_TARGET_DESCRIPTIONS: Record<RepoTarget, string> = {
  "whole-repo": "Cross-cutting coverage for the full QuantumSpark Pro stack.",
  frontend: "Vanilla JS trading dashboard focused on UX and release safety.",
  backend: "Express API focused on reliability, APIs, and dependency risk.",
  app: "Next.js Mission Control surfaces and app routes.",
};

export const AGENT_RECOMMENDATIONS: AgentRecommendation[] = [
  {
    name: "Sonar",
    rank: 1,
    score: FIT_SCORES.bestInClass,
    focus: "quality",
    bestFor: "Always-on code quality, bug finding, and PR guardrails.",
    summary:
      "Best first install because it improves reliability across frontend, backend, and Next.js code without changing your release flow.",
    launchUrl: "https://www.sonarsource.com/products/sonarqube/",
    repoTargets: orderTargets("whole-repo", "frontend", "backend", "app"),
    repoNotes: {
      "whole-repo": "Use this first across the full repo to raise baseline quality on every PR.",
      frontend: "Catches maintainability issues and regressions in dashboard code.",
      backend: "Adds strong bug and vulnerability detection for Express endpoints.",
      app: "Improves safety for server components, routes, and shared logic.",
    },
  },
  {
    name: "Endor Labs",
    rank: 2,
    score: FIT_SCORES.excellent,
    focus: "security",
    bestFor: "Dependency and software supply chain protection.",
    summary:
      "Strong second choice if you want to reduce open-source package risk across API, app, and tooling dependencies.",
    launchUrl: "https://www.endorlabs.com/",
    repoTargets: orderTargets("whole-repo", "backend", "app"),
    repoNotes: {
      "whole-repo": "Best for org-level dependency policy and package risk visibility.",
      backend: "Useful where the API depends on ecosystem packages and security posture matters most.",
      app: "Protects your Next.js dependencies and build chain from risky packages.",
    },
  },
  {
    name: "LaunchDarkly",
    rank: 3,
    score: FIT_SCORES.veryStrong,
    focus: "release",
    bestFor: "Feature flags, gradual rollouts, and safer launches.",
    summary:
      "Excellent when you want to ship user-facing features more safely in the trading dashboard and app experiences.",
    launchUrl: "https://launchdarkly.com/",
    repoTargets: orderTargets("frontend", "backend", "app"),
    repoNotes: {
      frontend: "Ideal for staged UI rollouts and rapid rollback of risky interface changes.",
      app: "Useful for controlled launches inside Mission Control and app-route features.",
      backend: "Supports API-level kill switches for risky functionality.",
    },
  },
  {
    name: "Bright Security",
    rank: 4,
    score: FIT_SCORES.strong,
    focus: "security",
    bestFor: "Dynamic testing of exposed web and API attack surfaces.",
    summary:
      "Best when you want active security scanning against running app and backend endpoints instead of only static analysis.",
    launchUrl: "https://brightsec.com/",
    repoTargets: orderTargets("backend", "app"),
    repoNotes: {
      backend: "Fits the Express API where runtime vulnerability testing matters.",
      app: "Helps validate exposed Next.js routes and authenticated flows.",
    },
  },
  {
    name: "Octopus Deploy",
    rank: 5,
    score: FIT_SCORES.solid,
    focus: "release",
    bestFor: "Deployment orchestration and environment promotion.",
    summary:
      "Best if release coordination becomes the bottleneck after code quality and security are under control.",
    launchUrl: "https://octopus.com/",
    repoTargets: orderTargets("whole-repo", "backend", "app"),
    repoNotes: {
      "whole-repo": "Useful once you need repeatable multi-environment delivery across the stack.",
      backend: "Helps with controlled backend promotion and rollback steps.",
      app: "Supports safer environment promotion for the Next.js app.",
    },
  },
  {
    name: "PagerDuty",
    rank: 6,
    score: FIT_SCORES.situational,
    focus: "operations",
    bestFor: "Incident response and production alert routing.",
    summary:
      "More valuable once you have meaningful traffic and on-call needs across backend and app surfaces.",
    launchUrl: "https://www.pagerduty.com/",
    repoTargets: orderTargets("whole-repo", "backend", "app"),
    repoNotes: {
      "whole-repo": "Best for connecting code changes to incidents once the platform is live.",
      backend: "Critical for API outages, latency spikes, and integration failures.",
      app: "Useful for customer-facing degradation and runbook-driven response.",
    },
  },
  {
    name: "Amplitude",
    rank: 7,
    score: FIT_SCORES.growthStage,
    focus: "growth",
    bestFor: "Product analytics and feature adoption insight.",
    summary:
      "Useful after the product is stable enough that optimization and growth experiments matter more than engineering safeguards.",
    launchUrl: "https://amplitude.com/",
    repoTargets: orderTargets("frontend", "app"),
    repoNotes: {
      frontend: "Tracks dashboard engagement, conversion, and user workflow friction.",
      app: "Measures Mission Control adoption and feature impact.",
    },
  },
  {
    name: "Miro",
    rank: 8,
    score: FIT_SCORES.lowerPriority,
    focus: "planning",
    bestFor: "Planning, diagrams, and cross-team collaboration.",
    summary:
      "Helpful for product and architecture alignment, but it will not directly raise code health or release safety.",
    launchUrl: "https://miro.com/",
    repoTargets: orderTargets("whole-repo"),
    repoNotes: {
      "whole-repo": "Best for roadmap and system-design collaboration rather than execution automation.",
    },
  },
  {
    name: "Packfiles",
    rank: 9,
    score: FIT_SCORES.migrationOnly,
    focus: "planning",
    bestFor: "Migration and modernization support.",
    summary:
      "Most useful for large migration programs; lower priority for the current QuantumSpark Pro stack.",
    launchUrl: "https://packfiles.io/",
    repoTargets: orderTargets("whole-repo"),
    repoNotes: {
      "whole-repo": "Consider later if you start a repo split, migration, or major modernization effort.",
    },
  },
];

const SORTED_AGENT_RECOMMENDATIONS = [...AGENT_RECOMMENDATIONS].sort(
  (left, right) => left.rank - right.rank
);

export function getRecommendationsForTarget(target: RepoTarget): AgentRecommendation[] {
  return SORTED_AGENT_RECOMMENDATIONS.filter((recommendation) =>
    recommendation.repoTargets.includes(target)
  );
}

export function filterRecommendations(
  target: RepoTarget,
  focus: AgentFocus
): AgentRecommendation[] {
  return getRecommendationsForTarget(target).filter(
    (recommendation) => focus === "all" || recommendation.focus === focus
  );
}

export function getTopRecommendation(target: RepoTarget): AgentRecommendation {
  return getRecommendationsForTarget(target)[0] ?? SORTED_AGENT_RECOMMENDATIONS[0];
}
