function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

export function renderDashboardCard({ title, value, status = "Tracking" }) {
    const statusTone =
        status === "Healthy"
            ? "text-emerald-400"
            : status === "Needs attention"
                ? "text-amber-400"
                : "text-sky-400";

    return `
        <article class="rounded-2xl border border-gray-700 bg-gray-800/90 p-6 shadow-lg">
            <p class="text-sm uppercase tracking-[0.2em] text-gray-400">${escapeHtml(title)}</p>
            <div class="mt-4 flex items-end justify-between gap-4">
                <p class="text-4xl font-bold text-white">${escapeHtml(value)}</p>
                <p class="text-sm font-semibold ${statusTone}">${escapeHtml(status)}</p>
            </div>
        </article>
    `;
}
