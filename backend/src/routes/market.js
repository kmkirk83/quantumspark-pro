const express = require("express");
const axios = require("axios");

const { getOpenAIClient } = require("../config");
const { authenticateToken, authorizeTier } = require("../middleware/auth");
const { getCurrentPrices, getHistoricalData, SYMBOLS } = require("../services/marketData");
const { buildSignalPrompt, calculateIndicators, runBacktest } = require("../services/trading");

const router = express.Router();

router.get("/prices", authenticateToken, async (_req, res) => {
  try {
    const prices = await getCurrentPrices();
    return res.json(prices);
  } catch (error) {
    console.error("Error fetching prices:", error.message);
    return res.status(500).json({ error: "Failed to fetch prices" });
  }
});

router.get("/indicators/:coinId", authenticateToken, authorizeTier("pro"), async (req, res) => {
  const { coinId } = req.params;
  const historicalData = await getHistoricalData(coinId, 30);
  const prices = historicalData.map((entry) => entry.price);

  if (prices.length < 30) {
    return res.status(400).json({ error: "Not enough data for indicators" });
  }

  return res.json(calculateIndicators(prices));
});

router.get("/signal/:coinId", authenticateToken, authorizeTier("enterprise"), async (req, res) => {
  const { coinId } = req.params;

  try {
    const indicatorsResponse = await axios.get(`http://localhost:${process.env.PORT || 5000}/api/indicators/${coinId}`, {
      headers: { Authorization: req.headers.authorization },
    });
    const indicators = indicatorsResponse.data;

    if (!indicators) {
      return res.status(400).json({ error: "Could not retrieve indicators for signal generation." });
    }

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
});

router.get("/backtest/:coinId", authenticateToken, authorizeTier("enterprise"), async (req, res) => {
  const { coinId } = req.params;
  const historicalData = await getHistoricalData(coinId, 30);

  if (historicalData.length < 30) {
    return res.status(400).json({ error: "Not enough historical data for backtesting (requires 30 days)." });
  }

  return res.json(runBacktest(coinId, historicalData));
});

module.exports = router;
