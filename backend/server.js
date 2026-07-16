const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { RSI, MACD, BollingerBands, EMA } = require("technicalindicators");
const OpenAI = require("openai");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Stripe = require("stripe");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(STRIPE_SECRET_KEY);

app.use(cors());
// Stripe webhook needs the raw body, so apply express.json() conditionally
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next(); // Skip express.json() for webhook route
    } else {
        express.json()(req, res, next);
    }
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// In-memory user store for demonstration
// In a real application, this would be a database
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
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

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
    const user = users.find(u => u.id === req.user.id); // Find user from in-memory store
    if (!user) return res.status(404).json({ message: "User not found" });

    const userTier = user.subscriptionTier; 

    const tiers = { "free": 0, "pro": 1, "enterprise": 2 };
    if (tiers[userTier] >= tiers[requiredTier]) {
        next();
    } else {
        res.status(403).json({ message: `Access denied. Requires ${requiredTier} subscription.` });
    }
};

// User Registration
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users.find(u => u.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, password: hashedPassword, subscriptionTier: "free" };
    users.push(newUser);

    res.status(201).json({ message: "User registered successfully", user: { id: newUser.id, username: newUser.username, subscriptionTier: newUser.subscriptionTier } });
});

// User Login
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ id: user.id, username: user.username, subscriptionTier: user.subscriptionTier }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ accessToken });
});

// Stripe Checkout Session Creation
app.post("/api/create-checkout-session", authenticateToken, async (req, res) => {
    const { tier } = req.body; // 'pro' or 'enterprise'
    const userId = req.user.id;

    let priceId;
    let metadata = { userId: userId.toString(), tier: tier };

    if (tier === "pro") {
        priceId = "price_12345"; // Replace with your actual Stripe Price ID for Pro
    } else if (tier === "enterprise") {
        priceId = "price_67890"; // Replace with your actual Stripe Price ID for Enterprise
    } else {
        return res.status(400).json({ error: "Invalid subscription tier" });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/cancel`,
            metadata: metadata,
        });
        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Stripe Webhook Handler
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            const userId = parseInt(session.metadata.userId);
            const newTier = session.metadata.tier;

            // Update user's subscription tier in your database (in-memory for this example)
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                users[userIndex].subscriptionTier = newTier;
                console.log(`User ${userId} updated to ${newTier} tier.`);
            } else {
                console.error(`User ${userId} not found for subscription update.`);
            }
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
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

app.get("/api/indicators/:coinId", authenticateToken, authorizeTier("pro"), async (req, res) => {
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

app.get("/api/signal/:coinId", authenticateToken, authorizeTier("enterprise"), async (req, res) => {
    const { coinId } = req.params;
    // Note: When calling internal APIs from within the same server, you might not need to pass the token
    // if the internal call bypasses the authentication middleware or uses a different mechanism.
    // For simplicity, we're passing it here as if it were an external call.
    const indicatorsResponse = await axios.get(`http://localhost:${PORT}/api/indicators/${coinId}`, {
        headers: { "Authorization": req.headers["authorization"] } // Pass token for internal call
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
