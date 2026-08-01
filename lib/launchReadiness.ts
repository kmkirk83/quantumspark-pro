export type LaunchSeverity = "Critical" | "High" | "Medium";

export interface LaunchEvidence {
  label: string;
  path: string;
  lines: string;
}

export interface LaunchRecommendation {
  id: string;
  title: string;
  category: "Reliability" | "Security" | "Performance" | "User Experience";
  severity: LaunchSeverity;
  summary: string;
  businessImpact: string;
  fixes: string[];
  validation: string[];
  evidence: LaunchEvidence[];
  actionLabel?: string;
  actionHref?: string;
}

export const launchRecommendations: LaunchRecommendation[] = [
  {
    id: "persistent-auth",
    title: "Replace in-memory auth with durable account storage",
    category: "Reliability",
    severity: "Critical",
    summary:
      "The backend stores users and subscription tiers in process memory, so restarts wipe accounts and paid entitlements.",
    businessImpact:
      "Real customers cannot keep accounts, subscriptions, or launch confidence without persistent identity data.",
    fixes: [
      "Add a production database for users, passwords, subscription tier state, and webhook reconciliation data.",
      "Move registration and login onto persistent records with safe unique constraints and recovery paths.",
      "Store Stripe customer and subscription identifiers so paid access can be reloaded after deploys and crashes.",
    ],
    validation: [
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro/backend && npm test",
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro/backend && npm run lint",
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro/backend && npm run build",
    ],
    evidence: [
      {
        label: "In-memory user store",
        path: "/home/runner/work/quantumspark-pro/quantumspark-pro/backend/server.js",
        lines: "33-35",
      },
      {
        label: "Tier lookup depends on process memory",
        path: "/home/runner/work/quantumspark-pro/quantumspark-pro/backend/server.js",
        lines: "73-86",
      },
    ],
  },
  {
    id: "payments-config",
    title: "Harden payments and deployment configuration",
    category: "Security",
    severity: "Critical",
    summary:
      "Checkout still uses placeholder Stripe price IDs and localhost redirect URLs instead of validated production configuration.",
    businessImpact:
      "You cannot safely collect revenue or trust billing flows until checkout is bound to real environment-specific config.",
    fixes: [
      "Move Stripe price IDs and public app URLs into validated environment variables checked at server startup.",
      "Reject checkout creation when billing configuration is missing instead of silently using placeholders.",
      "Add webhook coverage that confirms subscription upgrades and invalid signature handling in production-like flows.",
    ],
    validation: [
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro/backend && npm test",
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro/backend && npm run lint",
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro/backend && npm run build",
    ],
    evidence: [
      {
        label: "Placeholder Stripe pricing",
        path: "/home/runner/work/quantumspark-pro/quantumspark-pro/backend/server.js",
        lines: "132-137",
      },
      {
        label: "Local-only success and cancel URLs",
        path: "/home/runner/work/quantumspark-pro/quantumspark-pro/backend/server.js",
        lines: "149-153",
      },
    ],
  },
  {
    id: "dashboard-contracts",
    title: "Repair broken dashboard-to-API contracts",
    category: "User Experience",
    severity: "High",
    summary:
      "The trading dashboard uses a dummy token and expects API fields the backend does not return, so key screens cannot work reliably.",
    businessImpact:
      "Prospects will hit broken charts and gated features during demos, reducing trust and conversion.",
    fixes: [
      "Replace the hard-coded token with a real login flow that stores and refreshes authenticated state safely.",
      "Align frontend data expectations with backend responses or extend the backend contract to include the needed chart payload.",
      "Add regression tests for the dashboard contract so price, indicator, and signal views stay compatible.",
    ],
    validation: [
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro/frontend && npm test",
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro/frontend && npm run lint",
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro/frontend && npm run build",
    ],
    evidence: [
      {
        label: "Dummy auth token in dashboard",
        path: "/home/runner/work/quantumspark-pro/quantumspark-pro/frontend/public/dashboard.js",
        lines: "9-17",
      },
      {
        label: "Chart expects prices from indicators API",
        path: "/home/runner/work/quantumspark-pro/quantumspark-pro/frontend/public/dashboard.js",
        lines: "47-52",
      },
      {
        label: "Indicators response omits prices array",
        path: "/home/runner/work/quantumspark-pro/quantumspark-pro/backend/server.js",
        lines: "236-242",
      },
    ],
  },
  {
    id: "release-guardrails",
    title: "Expand release tests and startup guardrails",
    category: "Reliability",
    severity: "High",
    summary:
      "Validation currently relies on placeholder backend tests and file-existence build checks instead of exercising core launch flows.",
    businessImpact:
      "Launch regressions can ship undetected because CI does not prove auth, billing, or trading endpoints actually work.",
    fixes: [
      "Replace placeholder backend coverage with real tests for auth, protected routes, Stripe webhook verification, and data contracts.",
      "Add startup validation for required secrets and service configuration before accepting traffic.",
      "Upgrade build verification from file checks to meaningful application-level smoke coverage where possible.",
    ],
    validation: [
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro && npm test",
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro && npm run lint",
      "cd /home/runner/work/quantumspark-pro/quantumspark-pro && npm run build",
    ],
    evidence: [
      {
        label: "Placeholder backend test",
        path: "/home/runner/work/quantumspark-pro/quantumspark-pro/backend/tests/placeholder.test.js",
        lines: "1-6",
      },
      {
        label: "Backend build only checks file presence",
        path: "/home/runner/work/quantumspark-pro/quantumspark-pro/backend/scripts/verify-server.js",
        lines: "1-10",
      },
      {
        label: "Frontend build only checks asset presence",
        path: "/home/runner/work/quantumspark-pro/quantumspark-pro/frontend/scripts/verify-assets.mjs",
        lines: "1-17",
      },
    ],
    actionLabel: "Open health endpoint",
    actionHref: "/api/health",
  },
];

const severityWeight: Record<LaunchSeverity, number> = {
  Critical: 5,
  High: 3,
  Medium: 2,
};

export function calculateLaunchScore(completedIds: string[]): number {
  const completed = new Set(completedIds);
  const totalWeight = launchRecommendations.reduce(
    (sum, recommendation) => sum + severityWeight[recommendation.severity],
    0
  );

  if (totalWeight === 0) {
    return 0;
  }

  const completedWeight = launchRecommendations.reduce((sum, recommendation) => {
    if (!completed.has(recommendation.id)) {
      return sum;
    }

    return sum + severityWeight[recommendation.severity];
  }, 0);

  return Math.round((completedWeight / totalWeight) * 100);
}

export function countBySeverity(
  recommendations: LaunchRecommendation[]
): Record<LaunchSeverity, number> {
  return recommendations.reduce<Record<LaunchSeverity, number>>(
    (counts, recommendation) => {
      counts[recommendation.severity] += 1;
      return counts;
    },
    {
      Critical: 0,
      High: 0,
      Medium: 0,
    }
  );
}

export function primaryLaunchFocus(
  recommendations: LaunchRecommendation[],
  completedIds: string[]
): LaunchRecommendation["category"] {
  const completed = new Set(completedIds);
  const remaining = recommendations.filter(
    (recommendation) => !completed.has(recommendation.id)
  );

  if (remaining.length === 0) {
    return "Reliability";
  }

  const counts = remaining.reduce<Record<LaunchRecommendation["category"], number>>(
    (result, recommendation) => {
      result[recommendation.category] += severityWeight[recommendation.severity];
      return result;
    },
    {
      Reliability: 0,
      Security: 0,
      Performance: 0,
      "User Experience": 0,
    }
  );

  return Object.entries(counts).sort((left, right) => right[1] - left[1])[0][0] as
    LaunchRecommendation["category"];
}
