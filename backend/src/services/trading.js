const { RSI, MACD, BollingerBands, EMA } = require("technicalindicators");

function calculateIndicators(prices) {
  const rsi = RSI.calculate({ values: prices, period: 14 });
  const macd = MACD.calculate({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  const bollingerBands = BollingerBands.calculate({ values: prices, period: 20, stdDev: 2 });
  const ema = EMA.calculate({ values: prices, period: 20 });

  return {
    rsi: rsi[rsi.length - 1],
    macd: macd[macd.length - 1],
    bollingerBands: bollingerBands[bollingerBands.length - 1],
    ema: ema[ema.length - 1],
    currentPrice: prices[prices.length - 1],
  };
}

function buildSignalPrompt(symbol, indicators) {
  return `Given the following technical indicators for ${symbol}:
    - Current Price: ${indicators.currentPrice}
    - RSI (14): ${indicators.rsi}
    - MACD: Histogram ${indicators.macd.histogram}, MACD ${indicators.macd.MACD}, Signal ${indicators.macd.signal}
    - Bollinger Bands: Upper ${indicators.bollingerBands.upper}, Middle ${indicators.bollingerBands.middle}, Lower ${indicators.bollingerBands.lower}
    - EMA (20): ${indicators.ema}

    Based on these indicators, provide a trading signal (BUY, SELL, or HOLD), a confidence score (0-100), and a brief reasoning for the signal. Respond in JSON format like this: { "signal": "BUY", "confidence": 85, "reasoning": "RSI is low, indicating oversold conditions, and MACD shows a bullish crossover." }`;
}

function runBacktest(coinId, historicalData) {
  let trades = [];
  let currentPosition = 0;
  let pnl = 0;
  let entryPrice = 0;
  let dailyReturns = [];

  for (let index = 29; index < historicalData.length; index += 1) {
    const pricesSlice = historicalData.slice(0, index + 1).map((entry) => entry.price);
    const currentPrice = historicalData[index].price;

    if (pricesSlice.length < 20) {
      continue;
    }

    const indicators = calculateIndicators(pricesSlice);
    let signal = "HOLD";

    if (indicators.rsi < 30 && indicators.macd.histogram > 0) {
      signal = "BUY";
    } else if (indicators.rsi > 70 && indicators.macd.histogram < 0) {
      signal = "SELL";
    }

    if (signal === "BUY" && currentPosition === 0) {
      currentPosition = 1;
      entryPrice = currentPrice;
      trades.push({ type: "BUY", price: currentPrice, date: new Date(historicalData[index].timestamp) });
    } else if (signal === "SELL" && currentPosition === 1) {
      currentPosition = 0;
      const profit = currentPrice - entryPrice;
      pnl += profit;
      dailyReturns.push(profit / entryPrice);
      trades.push({ type: "SELL", price: currentPrice, date: new Date(historicalData[index].timestamp), profit });
    }
  }

  if (currentPosition === 1) {
    const finalPrice = historicalData[historicalData.length - 1].price;
    const profit = finalPrice - entryPrice;
    pnl += profit;
    dailyReturns.push(profit / entryPrice);
    trades.push({
      type: "SELL",
      price: finalPrice,
      date: new Date(historicalData[historicalData.length - 1].timestamp),
      profit,
    });
  }

  const winningTrades = trades.filter((trade) => trade.profit > 0).length;
  const totalTrades = trades.filter((trade) => trade.type === "SELL").length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const averageDailyReturn =
    dailyReturns.length > 0
      ? dailyReturns.reduce((sum, value) => sum + value, 0) / dailyReturns.length
      : 0;
  const stdDevDailyReturn =
    dailyReturns.length > 0
      ? Math.sqrt(
          dailyReturns
            .map((value) => Math.pow(value - averageDailyReturn, 2))
            .reduce((sum, value) => sum + value, 0) / dailyReturns.length
        )
      : 0;
  const sharpeRatio =
    stdDevDailyReturn > 0 ? (averageDailyReturn * Math.sqrt(365)) / stdDevDailyReturn : 0;

  return {
    coinId,
    backtestPeriod: "30 days",
    totalPnL: pnl,
    winRate,
    sharpeRatio,
    trades,
  };
}

module.exports = {
  buildSignalPrompt,
  calculateIndicators,
  runBacktest,
};
