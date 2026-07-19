export function calculateScore(checks) {
    if (!checks.length) {
        return 0;
    }

    const completedChecks = checks.filter((check) => check.complete).length;

    return Math.round((completedChecks / checks.length) * 100);
}
