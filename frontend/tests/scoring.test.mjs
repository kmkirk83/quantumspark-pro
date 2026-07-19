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
