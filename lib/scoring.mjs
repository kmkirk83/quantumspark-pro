/**
 * JavaScript mirror of lib/scoring.ts for use by the Node.js test runner.
 * Keep in sync with lib/scoring.ts.
 */

/**
 * Calculates a readiness score (0–100) as the percentage of completed checks,
 * rounded to the nearest integer.
 * @param {{ complete: boolean }[]} checks
 */
export function calculateScore(checks) {
  if (checks.length === 0) {
    return 0;
  }
  const completed = checks.filter((check) => check.complete).length;
  return Math.round((completed / checks.length) * 100);
}

/**
 * Groups checks by category and returns counts per category.
 * @param {{ category: string }[]} checks
 */
export function groupByCategory(checks) {
  return checks.reduce((counts, check) => {
    counts[check.category] = (counts[check.category] ?? 0) + 1;
    return counts;
  }, {});
}

/**
 * Returns the category with the most checks, falling back to "Reliability".
 * @param {{ category: string }[]} checks
 */
export function primaryFocusCategory(checks) {
  const counts = groupByCategory(checks);
  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  return sorted[0]?.[0] ?? "Reliability";
}
