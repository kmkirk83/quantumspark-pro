const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { RSI, MACD, BollingerBands, EMA } = require('technicalindicators');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const COINS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'cardano', 'ripple'];
const SYMBOLS = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'solana': 'SOL',
    'binancecoin': 'BNB',
    'cardano': 'ADA',
    'ripple': 'XRP'
};

// Helper to fetch historical data for indicators
async function getHistoricalData(coinId) {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`);
        return response.data.prices.map(p => p[1]); // Return only closing prices
    } catch (error) {
        console.error(`Error fetching historical data for ${coinId}:`, error.message);
        return [];
    }
}

app.get('/api/prices', async (req, res) => {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${COINS.join(',')}&vs_currencies=usd&include_24hr_change=true`);
        
        const prices = Object.keys(response.data).map(id => ({
            id: id,
            symbol: SYMBOLS[id],
            price: response.data[id].usd,
            change24h: response.data[id].usd_24h_change
        }));

        res.json(prices);
    } catch (error) {
        console.error('Error fetching prices:', error.message);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

app.get('/api/indicators/:coinId', async (req, res) => {
    const { coinId } = req.params;
    const prices = await getHistoricalData(coinId);

    if (prices.length < 30) {
        return res.status(400).json({ error: 'Not enough data for indicators' });
    }

    const rsi = RSI.calculate({ values: prices, period: 14 });
    const macd = MACD.calculate({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false
    });
    const bb = BollingerBands.calculate({ values: prices, period: 20, stdDev: 2 });
    const ema = EMA.calculate({ values: prices, period: 20 });

    res.json({
        rsi: rsi[rsi.length - 1],
        macd: macd[macd.length - 1],
        bollingerBands: bb[bb.length - 1],
        ema: ema[ema.length - 1],
        currentPrice: prices[prices.length - 1]
    });
});

app.get('/', (req, res) => {
    res.send('QuantumSpark Pro API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
