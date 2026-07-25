/**
 * @typedef {"positive" | "neutral" | "negative"} SnapshotTone
 * @typedef {"bullish" | "neutral" | "bearish"} SignalSentiment
 */

export const readinessChecks = [
  { name: "Copilot repository instructions", complete: true, category: "Reliability" },
  { name: "Mission Control dashboard shell", complete: true, category: "User Experience" },
  { name: "Readiness scoring engine", complete: true, category: "Performance" },
  { name: "Automated CI workflow", complete: true, category: "Reliability" },
  { name: "GitHub API connection", complete: true, category: "Growth" },
  { name: "Health check API", complete: true, category: "Reliability" },
  { name: "Deployment checks", complete: false, category: "Reliability" },
  { name: "Security checks", complete: true, category: "Security" },
  { name: "AI recommendation engine", complete: false, category: "Growth" },
  { name: "Automated issue creation", complete: false, category: "Reliability" },
  { name: "Production score updates", complete: false, category: "Performance" },
];

export const marketMetrics = [
  {
    label: "Net exposure",
    value: "68%",
    detail: "Balanced across majors with AI-weighted sizing.",
  },
  {
    label: "Unrealized P&L",
    value: "+$184K",
    detail: "Momentum-led gains with tighter downside rails.",
  },
  {
    label: "Automation coverage",
    value: "91%",
    detail: "Alerts, hedges, and sync jobs monitored continuously.",
  },
];

/** @type {{label: string, value: string, detail: string, badge: string, tone: SnapshotTone}[]} */
export const marketSnapshots = [
  {
    label: "Market breadth",
    value: "24 / 30 green",
    detail: "Risk appetite remains broad across majors and AI baskets.",
    badge: "Momentum",
    tone: "positive",
  },
  {
    label: "Stablecoin flows",
    value: "-6.1%",
    detail: "Lower exchange inflows reduce immediate sell pressure.",
    badge: "Cooling",
    tone: "positive",
  },
  {
    label: "Liquidation risk",
    value: "Moderate",
    detail: "Leverage pockets remain concentrated around BTC breakouts.",
    badge: "Monitor",
    tone: "neutral",
  },
  {
    label: "Alert integrity",
    value: "100%",
    detail: "No failed signal dispatches in the last 24 hours.",
    badge: "Trusted",
    tone: "positive",
  },
];

export const watchlist = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 67420,
    change: 2.4,
    volume: 38200000000,
    signal: "Accumulate",
    confidence: 92,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3490,
    change: 1.7,
    volume: 21400000000,
    signal: "Momentum build",
    confidence: 86,
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 182,
    change: 3.8,
    volume: 7900000000,
    signal: "Breakout watch",
    confidence: 81,
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    price: 18.4,
    change: -0.9,
    volume: 1200000000,
    signal: "Wait for pullback",
    confidence: 64,
  },
];

/** @type {{asset: string, action: string, reason: string, confidence: number, horizon: string, sentiment: SignalSentiment}[]} */
export const aiSignals = [
  {
    asset: "BTC",
    action: "Scale in",
    reason: "Spot demand remains stronger than leverage growth and volatility is compressing near support.",
    confidence: 92,
    horizon: "4-12 hours",
    sentiment: "bullish",
  },
  {
    asset: "SOL",
    action: "Momentum watch",
    reason: "Order flow is improving, but breakout confirmation still depends on sustained volume.",
    confidence: 81,
    horizon: "Next session",
    sentiment: "neutral",
  },
  {
    asset: "LINK",
    action: "Reduce risk",
    reason: "Relative strength is fading while market breadth rotates toward higher-liquidity names.",
    confidence: 73,
    horizon: "Immediate",
    sentiment: "bearish",
  },
];

export const riskControls = [
  {
    name: "Circuit breakers",
    detail: "Auto-halt execution if slippage or latency exceeds tolerance.",
    complete: true,
  },
  {
    name: "Position caps",
    detail: "Portfolio concentration limits keep directional exposure in bounds.",
    complete: true,
  },
  {
    name: "Exchange failover",
    detail: "Secondary routing prepared for degraded exchange performance.",
    complete: false,
  },
];

export const allocation = [
  { name: "Core majors", share: 46, tone: "bg-cyan-400" },
  { name: "Tactical AI basket", share: 28, tone: "bg-violet-400" },
  { name: "Yield reserve", share: 16, tone: "bg-emerald-400" },
  { name: "Cash buffer", share: 10, tone: "bg-slate-400" },
];

export const experiencePillars = [
  {
    title: "Clear hierarchy",
    detail: "Top apps lead with balances, P&L, and system state before secondary detail.",
  },
  {
    title: "Actionable context",
    detail: "Signals explain why they exist so users can decide fast without guessing.",
  },
  {
    title: "Trust surfaces",
    detail: "Risk controls, uptime cues, and audit-friendly activity stay visible at all times.",
  },
];

export const activityFeed = [
  {
    title: "ETH hedge tightened",
    detail: "Volatility band widened and stop-loss automation adjusted to preserve gains.",
    time: "3m ago",
  },
  {
    title: "Signal digest delivered",
    detail: "High-confidence BTC and SOL opportunities were sent to subscribed operators.",
    time: "11m ago",
  },
  {
    title: "Exchange sync verified",
    detail: "Balances, fills, and fees reconciled without drift across connected venues.",
    time: "28m ago",
  },
];

/**
 * @param {{ sentiment: SignalSentiment }[]} signals
 */
export function summarizeSignals(signals) {
  return signals.reduce(
    (summary, signal) => {
      summary[signal.sentiment] += 1;
      return summary;
    },
    { bullish: 0, neutral: 0, bearish: 0 },
  );
}

/**
 * @param {{ change: number }[]} assets
 */
export function computeWatchlistStats(assets) {
  if (assets.length === 0) {
    return { advancers: 0, decliners: 0, averageMove: 0 };
  }

  const advancers = assets.filter((asset) => asset.change >= 0).length;
  const decliners = assets.length - advancers;
  const averageMove =
    Math.round(
      (assets.reduce((total, asset) => total + asset.change, 0) / assets.length) *
        10,
    ) / 10;

  return { advancers, decliners, averageMove };
}

/**
 * @param {{ complete: boolean }[]} items
 */
export function calculateCompletionRate(items) {
  if (items.length === 0) {
    return 0;
  }

  return Math.round(
    (items.filter((item) => item.complete).length / items.length) * 100,
  );
}
