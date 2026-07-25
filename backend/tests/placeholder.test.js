const test = require("node:test");
const assert = require("node:assert/strict");

const { calculateIndicators } = require("../src/services/trading");

test("trading indicators return latest values", () => {
  const prices = Array.from({ length: 40 }, (_, index) => 100 + index);
  const indicators = calculateIndicators(prices);

  assert.equal(typeof indicators.currentPrice, "number");
  assert.equal(indicators.currentPrice, prices[prices.length - 1]);
  assert.equal(typeof indicators.rsi, "number");
  assert.equal(typeof indicators.ema, "number");
  assert.equal(typeof indicators.macd.histogram, "number");
  assert.equal(typeof indicators.bollingerBands.upper, "number");
});
