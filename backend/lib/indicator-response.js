function buildIndicatorsResponse({ prices, rsi, macd, bollingerBands, ema }) {
    return {
        // Preserve the historical price array for the frontend chart alongside the indicator snapshot.
        prices,
        rsi: rsi[rsi.length - 1],
        macd: macd[macd.length - 1],
        bollingerBands: bollingerBands[bollingerBands.length - 1],
        ema: ema[ema.length - 1],
        currentPrice: prices[prices.length - 1],
    };
}

module.exports = { buildIndicatorsResponse };
