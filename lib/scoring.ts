export interface Check {
  name: string;
  complete: boolean;
  category: string;
}

/**
 * Calculates the readiness score as a percentage of completed checks.
 * Returns a whole number from 0 to 100.
 */
export function calculateScore(checks: Check[]): number {
  if (!checks.length) {
    return 0;
  }

  const completedChecks = checks.filter((check) => check.complete).length;
  return Math.round((completedChecks / checks.length) * 100);
}
