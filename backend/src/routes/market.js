const express = require("express");

const { getOpenAIClient } = require("../config");
const { authenticateToken, authorizeTier } = require("../middleware/auth");
const { rateLimit } = require("../middleware/rateLimit");
const {
  assertSupportedCoinId,
  getCurrentPrices,
  getHistoricalData,
  SYMBOLS,
} = require("../services/marketData");
const {
  buildSignalPrompt,
  calculateIndicators,
  runBacktest,
} = require("../services/trading");

const router = express.Router();
const protectedRouteMiddleware = [rateLimit(), authenticateToken];

router.get("/prices", ...protectedRouteMiddleware, async (_req, res) => {
  try {
    const prices = await getCurrentPrices();
    return res.json(prices);
  } catch (error) {
    console.error("Error fetching prices:", error.message);
    return res.status(500).json({ error: "Failed to fetch prices" });
  }
});

router.get(
  "/indicators/:coinId",
  ...protectedRouteMiddleware,
  authorizeTier("pro"),
  async (req, res) => {
    try {
      const coinId = assertSupportedCoinId(req.params.coinId);
      const historicalData = await getHistoricalData(coinId, 30);
      const prices = historicalData.map((entry) => entry.price);

      if (prices.length < 30) {
        return res.status(400).json({ error: "Not enough data for indicators" });
      }

      return res.json(calculateIndicators(prices));
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
);

router.get(
  "/signal/:coinId",
  ...protectedRouteMiddleware,
  authorizeTier("enterprise"),
  async (req, res) => {
    try {
      const coinId = assertSupportedCoinId(req.params.coinId);
      const historicalData = await getHistoricalData(coinId, 30);
      const prices = historicalData.map((entry) => entry.price);

      if (prices.length < 30) {
        return res.status(400).json({ error: "Not enough data for indicators" });
      }

      const indicators = calculateIndicators(prices);
      const completion = await getOpenAIClient().chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: buildSignalPrompt(SYMBOLS[coinId], indicators) }],
        response_format: { type: "json_object" },
      });

      return res.json(JSON.parse(completion.choices[0].message.content));
    } catch (error) {
      console.error("Error generating signal with OpenAI:", error.message);
      return res.status(500).json({ error: "Failed to generate signal" });
    }
  }
);

router.get(
  "/backtest/:coinId",
  ...protectedRouteMiddleware,
  authorizeTier("enterprise"),
  async (req, res) => {
    try {
      const coinId = assertSupportedCoinId(req.params.coinId);
      const historicalData = await getHistoricalData(coinId, 30);

      if (historicalData.length < 30) {
        return res
          .status(400)
          .json({ error: "Not enough historical data for backtesting (requires 30 days)." });
      }

      return res.json(runBacktest(coinId, historicalData));
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
