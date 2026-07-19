import { renderDashboardCard } from "./components/dashboard-card.js";
import { calculateScore } from "./lib/scoring.js";

const readinessChecks = [
    { name: "Copilot repository instructions", complete: true, category: "Reliability" },
    { name: "Mission Control dashboard shell", complete: true, category: "User Experience" },
    { name: "Readiness scoring engine", complete: true, category: "Performance" },
    { name: "Automated CI workflow", complete: true, category: "Reliability" },
    { name: "GitHub API connection", complete: false, category: "Growth" },
    { name: "Deployment checks", complete: false, category: "Reliability" },
    { name: "Security checks", complete: false, category: "Security" },
    { name: "AI recommendation engine", complete: false, category: "Growth" },
    { name: "Automated issue creation", complete: false, category: "Reliability" },
    { name: "Production score updates", complete: false, category: "Performance" }
];

const cardsContainer = document.getElementById("mission-control-cards");
const checklistContainer = document.getElementById("readiness-checklist");
const roadmapContainer = document.getElementById("next-layer-roadmap");

const readinessScore = calculateScore(readinessChecks);
const completedChecks = readinessChecks.filter((check) => check.complete);
const pendingChecks = readinessChecks.filter((check) => !check.complete);

const categoryCounts = readinessChecks.reduce((counts, check) => {
    counts[check.category] = (counts[check.category] || 0) + 1;
    return counts;
}, {});

const primaryFocus = Object.entries(categoryCounts)
    .sort((left, right) => right[1] - left[1])[0]?.[0] || "Reliability";

cardsContainer.innerHTML = [
    renderDashboardCard({
        title: "Readiness score",
        value: `${readinessScore}%`,
        status: readinessScore >= 70 ? "Healthy" : "Needs attention"
    }),
    renderDashboardCard({
        title: "Completed checks",
        value: `${completedChecks.length}/${readinessChecks.length}`,
        status: "Foundation ready"
    }),
    renderDashboardCard({
        title: "Primary focus",
        value: primaryFocus,
        status: "Next investment"
    })
].join("");

checklistContainer.innerHTML = readinessChecks
    .map((check) => `
        <li class="flex items-start justify-between gap-4 rounded-xl border border-gray-700 bg-gray-800/70 px-4 py-3">
            <div>
                <p class="font-semibold text-white">${check.name}</p>
                <p class="text-sm text-gray-400">${check.category}</p>
            </div>
            <span class="rounded-full px-3 py-1 text-xs font-semibold ${check.complete ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}">
                ${check.complete ? "Complete" : "Planned"}
            </span>
        </li>
    `)
    .join("");

roadmapContainer.innerHTML = pendingChecks
    .map((check) => `
        <li class="rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3">
            <p class="font-semibold text-white">${check.name}</p>
            <p class="text-sm text-gray-400">${check.category}</p>
        </li>
    `)
    .join("");
