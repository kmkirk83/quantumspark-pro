import test from "node:test";
import assert from "node:assert/strict";

import {
  aiSignals,
  calculateCompletionRate,
  computeWatchlistStats,
  riskControls,
  summarizeSignals,
  watchlist,
} from "../lib/dashboardContent.mjs";

test("summarizeSignals groups sentiments correctly", () => {
  assert.deepEqual(summarizeSignals(aiSignals), {
    bullish: 1,
    neutral: 1,
    bearish: 1,
  });
});

test("computeWatchlistStats counts winners and averages moves", () => {
  assert.deepEqual(computeWatchlistStats(watchlist), {
    advancers: 3,
    decliners: 1,
    averageMove: 1.8,
  });
});

test("calculateCompletionRate rounds completed control coverage", () => {
  assert.equal(calculateCompletionRate(riskControls), 67);
});

test("completion rate returns zero for empty lists", () => {
  assert.equal(calculateCompletionRate([]), 0);
});
