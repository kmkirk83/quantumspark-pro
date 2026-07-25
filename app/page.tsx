import { SystemHealth } from "@/components/SystemHealth";
import type { ReadinessCheck } from "@/lib/scoring";
import {
  activityFeed,
  aiSignals,
  allocation,
  calculateCompletionRate,
  computeWatchlistStats,
  experiencePillars,
  marketMetrics,
  marketSnapshots,
  readinessChecks,
  riskControls,
  summarizeSignals,
  watchlist,
} from "@/lib/dashboardContent.mjs";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const READINESS_CHECKS: ReadinessCheck[] = readinessChecks;

function formatDelta(value: number) {
  return `${value >= 0 ? "+" : ""}${percentFormatter.format(value)}%`;
}

export default function MissionControlPage() {
  const signalSummary = summarizeSignals(aiSignals);
  const watchlistStats = computeWatchlistStats(watchlist);
  const riskCoverage = calculateCompletionRate(riskControls);

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
        <header className="glass-panel flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.32em] text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              QuantumSpark Pro
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                AI trading cockpit built for fast reads, clear actions, and
                trust.
              </h1>
              <p className="mt-3 max-w-3xl text-base text-slate-300 md:text-lg">
                The previous interface was functional but too plain for this
                category. This redesign matches top trading apps by combining a
                clear portfolio summary, a chart-first workspace, watchlists,
                AI context, and risk visibility in one flow.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              Review live opportunities
            </button>
            <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:bg-white/10">
              Configure safeguards
            </button>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 sm:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <span>Execution health</span>
                <span className="font-semibold">99.92% successful</span>
              </div>
              <p className="mt-1 text-xs text-emerald-100/80">
                Exchange sync, risk rails, and alerts are surfaced before users
                commit capital.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="glass-panel overflow-hidden p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">
                  Portfolio overview
                </p>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <span className="text-5xl font-semibold text-white">
                    $2.84M
                  </span>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                    +8.4% this week
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-sm text-slate-300">
                  Designed around the patterns users expect from category leaders:
                  critical balances first, decisions next, detail on demand.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {marketMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {marketSnapshots.map((snapshot) => (
                <div
                  key={snapshot.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-300">{snapshot.label}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        snapshot.tone === "positive"
                          ? "bg-emerald-400/10 text-emerald-200"
                          : snapshot.tone === "negative"
                            ? "bg-rose-400/10 text-rose-200"
                            : "bg-cyan-400/10 text-cyan-100"
                      }`}
                    >
                      {snapshot.badge}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {snapshot.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{snapshot.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="glass-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-violet-200">
                  Trust center
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Robust enough for high-conviction decisions
                </h2>
              </div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                {riskCoverage}% protected
              </span>
            </div>

            <ul className="mt-6 space-y-3">
              {riskControls.map((control) => (
                <li
                  key={control.name}
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{control.name}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {control.detail}
                      </p>
                    </div>
                    <span
                      className={`mt-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        control.complete
                          ? "bg-emerald-400/10 text-emerald-200"
                          : "bg-amber-400/10 text-amber-100"
                      }`}
                    >
                      {control.complete ? "Live" : "Queued"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Bullish signals
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {signalSummary.bullish}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Neutral setups
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {signalSummary.neutral}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Risk-off flags
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {signalSummary.bearish}
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="glass-panel p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">
                  Market cockpit
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Chart-first workspace with AI context layered in
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {["1H", "4H", "1D", "1W", "1M"].map((range, index) => (
                  <button
                    key={range}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      index === 2
                        ? "bg-cyan-400 text-slate-950"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.48))] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">BTC / USD</p>
                    <p className="mt-1 text-3xl font-semibold text-white">
                      {currencyFormatter.format(67420)}
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                    {formatDelta(2.4)}
                  </span>
                </div>
                <div className="mt-5 overflow-hidden rounded-[24px] border border-cyan-400/10 bg-slate-950/75 p-4">
                  <div className="grid h-72 grid-cols-12 gap-2">
                    {[38, 42, 35, 48, 44, 52, 58, 56, 62, 66, 61, 72].map(
                      (height, index) => (
                        <div
                          key={height}
                          className="flex items-end justify-center"
                        >
                          <div
                            className={`w-full rounded-t-full ${
                              index > 7
                                ? "bg-gradient-to-t from-cyan-500 to-violet-400"
                                : "bg-gradient-to-t from-slate-600 to-slate-400"
                            }`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ),
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Volume spike after AI accumulation signal</span>
                    <span>RSI 58 · MACD positive</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-cyan-400/10 bg-cyan-400/5 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-100">
                    Why this matters
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    Confidence-backed AI insight
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Strong BTC breadth plus falling stablecoin inflows suggests
                    buyers are defending momentum rather than chasing a late move.
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-violet-200">
                    Watchlist pulse
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-400">Advancers</p>
                      <p className="mt-1 text-2xl font-semibold text-white">
                        {watchlistStats.advancers}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Decliners</p>
                      <p className="mt-1 text-2xl font-semibold text-white">
                        {watchlistStats.decliners}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Avg move</p>
                      <p className="mt-1 text-2xl font-semibold text-white">
                        {formatDelta(watchlistStats.averageMove)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-300">
                    Design pillars
                  </p>
                  <ul className="mt-4 space-y-3">
                    {experiencePillars.map((pillar) => (
                      <li
                        key={pillar.title}
                        className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3"
                      >
                        <p className="font-semibold text-white">{pillar.title}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {pillar.detail}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="glass-panel p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-violet-200">
                    Smart watchlist
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Scan, compare, act
                  </h2>
                </div>
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
                  Add asset
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {watchlist.map((asset) => (
                  <div
                    key={asset.symbol}
                    className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-base font-semibold text-white">
                            {asset.symbol}
                          </p>
                          <span className="text-sm text-slate-400">
                            {asset.name}
                          </span>
                        </div>
                        <p className="mt-2 text-xl font-semibold text-white">
                          {currencyFormatter.format(asset.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            asset.change >= 0 ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {formatDelta(asset.change)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {compactCurrencyFormatter.format(asset.volume)} volume
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                      <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-cyan-100">
                        {asset.signal}
                      </span>
                      <span className="text-slate-400">
                        Confidence {asset.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">
                Allocation
              </p>
              <div className="mt-5 space-y-4">
                {allocation.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white">{item.name}</span>
                      <span className="text-slate-300">{item.share}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/5">
                      <div
                        className={`h-2 rounded-full ${item.tone}`}
                        style={{ width: `${item.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr_0.9fr]">
          <section className="glass-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">
                  AI signal feed
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Contextual, not noisy
                </h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                Updated 14s ago
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {aiSignals.map((signal) => (
                <article
                  key={signal.asset}
                  className="rounded-3xl border border-white/10 bg-slate-950/35 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {signal.asset}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            signal.sentiment === "bullish"
                              ? "bg-emerald-400/10 text-emerald-200"
                              : signal.sentiment === "bearish"
                                ? "bg-rose-400/10 text-rose-200"
                                : "bg-amber-400/10 text-amber-100"
                          }`}
                        >
                          {signal.action}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        {signal.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        {signal.confidence}%
                      </p>
                      <p className="text-xs text-slate-500">{signal.horizon}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-violet-200">
              System health
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Product readiness stays visible
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Users of this category expect the platform to feel dependable, not
              experimental. Operational signals stay close to the trading
              experience.
            </p>
            <div className="mt-6">
              <SystemHealth checks={READINESS_CHECKS} />
            </div>
          </section>

          <section className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">
              Activity timeline
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Recent automation
            </h2>
            <div className="mt-5 space-y-4">
              {activityFeed.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{item.title}</p>
                    <span className="text-xs text-slate-500">{item.time}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="glass-panel p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-violet-200">
                Readiness roadmap
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                What remains before full-scale rollout
              </h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              {READINESS_CHECKS.filter((check) => !check.complete).length} planned
              milestones
            </span>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {READINESS_CHECKS.map((check) => (
              <div
                key={check.name}
                className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{check.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{check.category}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      check.complete
                        ? "bg-emerald-400/10 text-emerald-200"
                        : "bg-amber-400/10 text-amber-100"
                    }`}
                  >
                    {check.complete ? "Complete" : "Planned"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
