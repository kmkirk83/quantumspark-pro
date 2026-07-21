import { SystemHealth } from "@/components/SystemHealth";
import type { ReadinessCheck } from "@/lib/scoring";

const READINESS_CHECKS: ReadinessCheck[] = [
  {
    name: "Copilot repository instructions",
    complete: true,
    category: "Reliability",
  },
  {
    name: "Mission Control dashboard shell",
    complete: true,
    category: "User Experience",
  },
  { name: "Readiness scoring engine", complete: true, category: "Performance" },
  { name: "Automated CI workflow", complete: true, category: "Reliability" },
  { name: "GitHub API connection", complete: true, category: "Growth" },
  { name: "Health check API", complete: true, category: "Reliability" },
  { name: "Deployment checks", complete: false, category: "Reliability" },
  { name: "Security checks", complete: false, category: "Security" },
  { name: "AI recommendation engine", complete: false, category: "Growth" },
  { name: "Automated issue creation", complete: false, category: "Reliability" },
  {
    name: "Production score updates",
    complete: false,
    category: "Performance",
  },
];

export default function MissionControlPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-6 border-b border-gray-800 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-purple-400">
            QuantumSpark Pro
          </p>
          <h1 className="mt-3 text-4xl font-bold">Mission Control</h1>
          <p className="mt-3 max-w-3xl text-gray-400">
            Platform readiness dashboard — track foundation health before live
            GitHub, deployment, security, and AI automation layers are
            connected.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <SystemHealth checks={READINESS_CHECKS} />
      </div>

      <section className="mt-10 rounded-2xl border border-gray-800 bg-gray-900/80 p-6 shadow-xl">
        <h2 className="text-2xl font-semibold">Readiness checklist</h2>
        <p className="mt-2 text-sm text-gray-400">
          Completed work and remaining Mission Control milestones.
        </p>
        <ul className="mt-6 space-y-3">
          {READINESS_CHECKS.map((check) => (
            <li
              key={check.name}
              className="flex items-start justify-between gap-4 rounded-xl border border-gray-700 bg-gray-800/70 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-white">{check.name}</p>
                <p className="text-sm text-gray-400">{check.category}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  check.complete
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {check.complete ? "Complete" : "Planned"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
