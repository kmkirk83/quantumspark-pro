const axios = require("axios");

const COINS = ["bitcoin", "ethereum", "solana", "binancecoin", "cardano", "ripple"];
const SYMBOLS = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
  binancecoin: "BNB",
  cardano: "ADA",
  ripple: "XRP",
};

function assertSupportedCoinId(coinId) {
  if (!COINS.includes(coinId)) {
    throw new Error("Unsupported coin");
  }

  return coinId;
}

async function getHistoricalData(coinId, days = 30) {
  const supportedCoinId = assertSupportedCoinId(coinId);

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${supportedCoinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );

    return response.data.prices.map(([timestamp, price]) => ({ timestamp, price }));
  } catch (error) {
    console.error("Error fetching historical data.", error.message);
    return [];
  }
}

async function getCurrentPrices() {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${COINS.join(",")}&vs_currencies=usd&include_24hr_change=true`
  );

  return Object.keys(response.data).map((id) => ({
    id,
    symbol: SYMBOLS[id],
    price: response.data[id].usd,
    change24h: response.data[id].usd_24h_change,
  }));
}

module.exports = {
  COINS,
  SYMBOLS,
  assertSupportedCoinId,
  getCurrentPrices,
  getHistoricalData,
};
