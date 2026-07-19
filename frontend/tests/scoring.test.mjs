import test from "node:test";
import assert from "node:assert/strict";

import { calculateScore } from "../public/lib/scoring.js";

test("calculateScore returns 0 for no checks", () => {
    assert.equal(calculateScore([]), 0);
});

test("calculateScore rounds completion percentage", () => {
    const score = calculateScore([
        { name: "One", complete: true, category: "Reliability" },
        { name: "Two", complete: true, category: "Security" },
        { name: "Three", complete: false, category: "Performance" }
    ]);

    assert.equal(score, 67);
});

test("calculateScore returns 100 when all checks are complete", () => {
    const score = calculateScore([
        { name: "One", complete: true, category: "Reliability" },
        { name: "Two", complete: true, category: "Security" }
    ]);

    assert.equal(score, 100);
});

test("calculateScore returns 0 when all checks are incomplete", () => {
    const score = calculateScore([
        { name: "One", complete: false, category: "Reliability" },
        { name: "Two", complete: false, category: "Security" }
    ]);

    assert.equal(score, 0);
});

test("calculateScore rounds one out of three checks to 33", () => {
    const score = calculateScore([
        { name: "One", complete: true, category: "Reliability" },
        { name: "Two", complete: false, category: "Security" },
        { name: "Three", complete: false, category: "Performance" }
    ]);

    assert.equal(score, 33);
});
