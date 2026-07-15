const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { RSI, MACD, BollingerBands, EMA } = require("technicalindicators");
const OpenAI = require("openai");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// In-memory user store for demonstration
const users = []; // { id, username, password, subscriptionTier: 'free' | 'pro' | 'enterprise' }

const COINS = ["bitcoin", "ethereum", "solana", "binancecoin", "cardano", "ripple"];
const SYMBOLS = {
    "bitcoin": "BTC",
    "ethereum": "ETH",
    "solana": "SOL",
    "binancecoin": "BNB",
    "cardano": "ADA",
    "ripple": "XRP"
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

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // No token

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user;
        next();
    });
};

// Middleware for subscription tier enforcement
const authorizeTier = (requiredTier) => (req, res, next) => {
    // In a real app, you'd fetch user from DB to get latest tier
    const userTier = req.user.subscriptionTier; 

    const tiers = { 'free': 0, 'pro': 1, 'enterprise': 2 };
    if (tiers[userTier] >= tiers[requiredTier]) {
        next();
    } else {
        res.status(403).json({ message: `Access denied. Requires ${requiredTier} subscription.` });
    }
};

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (users.find(u => u.username === username)) {
        return res.status(409).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, password: hashedPassword, subscriptionTier: 'free' };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, username: newUser.username, subscriptionTier: newUser.subscriptionTier } });
});

// User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user.id, username: user.username, subscriptionTier: user.subscriptionTier }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken });
});

app.get("/api/prices", authenticateToken, async (req, res) => {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${COINS.join(",")}&vs_currencies=usd&include_24hr_change=true`);
        
        const prices = Object.keys(response.data).map(id => ({
            id: id,
            symbol: SYMBOLS[id],
            price: response.data[id].usd,
            change24h: response.data[id].usd_24h_change
        }));

        res.json(prices);
    } catch (error) {
        console.error("Error fetching prices:", error.message);
        res.status(500).json({ error: "Failed to fetch prices" });
    }
});

app.get("/api/indicators/:coinId", authenticateToken, authorizeTier('pro'), async (req, res) => {
    const { coinId } = req.params;
    const prices = await getHistoricalData(coinId);

    if (prices.length < 30) {
        return res.status(400).json({ error: "Not enough data for indicators" });
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

app.get("/api/signal/:coinId", authenticateToken, authorizeTier('enterprise'), async (req, res) => {
    const { coinId } = req.params;
    const indicatorsResponse = await axios.get(`http://localhost:${PORT}/api/indicators/${coinId}`, {
        headers: { 'Authorization': req.headers['authorization'] } // Pass token for internal call
    });
    const indicators = indicatorsResponse.data;

    if (!indicators) {
        return res.status(400).json({ error: "Could not retrieve indicators for signal generation." });
    }

    const prompt = `Given the following technical indicators for ${SYMBOLS[coinId]}:
    - Current Price: ${indicators.currentPrice}
    - RSI (14): ${indicators.rsi}
    - MACD: Histogram ${indicators.macd.histogram}, MACD ${indicators.macd.MACD}, Signal ${indicators.macd.signal}
    - Bollinger Bands: Upper ${indicators.bollingerBands.upper}, Middle ${indicators.bollingerBands.middle}, Lower ${indicators.bollingerBands.lower}
    - EMA (20): ${indicators.ema}

    Based on these indicators, provide a trading signal (BUY, SELL, or HOLD), a confidence score (0-100), and a brief reasoning for the signal. Respond in JSON format like this: { "signal": "BUY", "confidence": 85, "reasoning": "RSI is low, indicating oversold conditions, and MACD shows a bullish crossover." }`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Or another suitable model
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });
        const signal = JSON.parse(completion.choices[0].message.content);
        res.json(signal);
    } catch (error) {
        console.error("Error generating signal with OpenAI:", error.message);
        res.status(500).json({ error: "Failed to generate signal" });
    }
});

app.get("/", (req, res) => {
    res.send("QuantumSpark Pro API is running...");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
