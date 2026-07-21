<<<<<<< HEAD
export interface ReadinessCheck {
=======
export interface Check {
>>>>>>> origin/main
  name: string;
  complete: boolean;
  category: string;
}

/**
<<<<<<< HEAD
 * Calculates a readiness score (0–100) as the percentage of completed checks,
 * rounded to the nearest integer.
 */
export function calculateScore(checks: ReadinessCheck[]): number {
  if (checks.length === 0) {
    return 0;
  }

  const completed = checks.filter((check) => check.complete).length;

  return Math.round((completed / checks.length) * 100);
}

/**
 * Groups checks by category and returns counts per category.
 */
export function groupByCategory(
  checks: ReadinessCheck[]
): Record<string, number> {
  return checks.reduce<Record<string, number>>((counts, check) => {
    counts[check.category] = (counts[check.category] ?? 0) + 1;
    return counts;
  }, {});
}

/**
 * Returns the category with the most checks, falling back to "Reliability".
 */
export function primaryFocusCategory(checks: ReadinessCheck[]): string {
  const counts = groupByCategory(checks);
  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  return sorted[0]?.[0] ?? "Reliability";
=======
 * Calculates the readiness score as a percentage of completed checks.
 * Returns a whole number from 0 to 100.
 */
export function calculateScore(checks: Check[]): number {
  if (!checks.length) {
    return 0;
  }

  const completedChecks = checks.filter((check) => check.complete).length;
  return Math.round((completedChecks / checks.length) * 100);
>>>>>>> origin/main
}
