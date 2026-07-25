const test = require("node:test");
const assert = require("node:assert/strict");

const { buildIndicatorsResponse } = require("../lib/indicator-response");

test("buildIndicatorsResponse preserves chart prices and latest indicators", () => {
    const response = buildIndicatorsResponse({
        prices: [101, 102, 103],
        rsi: [45, 47],
        macd: [{ histogram: 1 }, { histogram: 2 }],
        bollingerBands: [{ upper: 105 }, { upper: 106 }],
        ema: [99, 100],
    });

    assert.deepEqual(response, {
        prices: [101, 102, 103],
        rsi: 47,
        macd: { histogram: 2 },
        bollingerBands: { upper: 106 },
        ema: 100,
        currentPrice: 103,
    });
});
