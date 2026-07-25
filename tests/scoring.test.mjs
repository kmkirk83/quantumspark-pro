import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateScore,
  groupByCategory,
  primaryFocusCategory,
} from "../lib/scoring.mjs";

// calculateScore

test("calculateScore returns 0 for empty checks", () => {
  assert.equal(calculateScore([]), 0);
});

test("calculateScore returns 100 when all checks are complete", () => {
  const checks = [
    { name: "A", complete: true, category: "Reliability" },
    { name: "B", complete: true, category: "Security" },
  ];
  assert.equal(calculateScore(checks), 100);
});

test("calculateScore returns 0 when no checks are complete", () => {
  const checks = [
    { name: "A", complete: false, category: "Reliability" },
    { name: "B", complete: false, category: "Security" },
  ];
  assert.equal(calculateScore(checks), 0);
});

test("calculateScore rounds to nearest integer", () => {
  const checks = [
    { name: "A", complete: true, category: "Reliability" },
    { name: "B", complete: false, category: "Security" },
    { name: "C", complete: false, category: "Performance" },
  ];
  // 1/3 = 33.33% → rounds to 33
  assert.equal(calculateScore(checks), 33);
});

// groupByCategory

test("groupByCategory returns empty object for empty checks", () => {
  assert.deepEqual(groupByCategory([]), {});
});

test("groupByCategory counts checks per category", () => {
  const checks = [
    { name: "A", complete: true, category: "Reliability" },
    { name: "B", complete: false, category: "Reliability" },
    { name: "C", complete: true, category: "Security" },
  ];
  assert.deepEqual(groupByCategory(checks), { Reliability: 2, Security: 1 });
});

test("groupByCategory handles a single category", () => {
  const checks = [
    { name: "A", complete: true, category: "Performance" },
    { name: "B", complete: false, category: "Performance" },
  ];
  assert.deepEqual(groupByCategory(checks), { Performance: 2 });
});

// primaryFocusCategory

test("primaryFocusCategory returns Reliability fallback for empty checks", () => {
  assert.equal(primaryFocusCategory([]), "Reliability");
});

test("primaryFocusCategory returns the category with the most checks", () => {
  const checks = [
    { name: "A", complete: true, category: "Security" },
    { name: "B", complete: false, category: "Reliability" },
    { name: "C", complete: true, category: "Reliability" },
  ];
  assert.equal(primaryFocusCategory(checks), "Reliability");
});

test("primaryFocusCategory returns the sole category when only one exists", () => {
  const checks = [
    { name: "A", complete: true, category: "Growth" },
    { name: "B", complete: false, category: "Growth" },
  ];
  assert.equal(primaryFocusCategory(checks), "Growth");
});
