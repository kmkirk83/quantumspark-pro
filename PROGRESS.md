# QuantumSpark Pro - Progress Tracking

## Roadmap
- [x] 1) Create repo with project structure (Express backend + static frontend with Tailwind)
- [x] 2) CoinGecko real-time price feed for BTC/ETH/SOL/BNB/ADA/XRP
- [x] 3) Real technical indicators (RSI 14, MACD 12/26/9, Bollinger Bands 20/2, EMA)
- [x] 4) OpenAI AI signal generation (BUY/SELL/HOLD with confidence scores and reasoning)
- [x] 5) JWT auth + server-side subscription tier enforcement
- [x] 6) Stripe checkout for Pro $29.99/mo and Enterprise $99.99/mo with test keys
- [x] 7) 30-day backtesting engine with win rate/PnL/Sharpe ratio
- [x] 8) Frontend dashboard with real Chart.js charts, live ticker, signal feed
- [ ] 9) Legal disclaimers + GitHub Pages deployment

## Completed Today
- Initialized repository and project structure.
- Set up Express backend and Tailwind CSS frontend.
- Implemented CoinGecko real-time price feed for major cryptocurrencies.
- Integrated `technicalindicators` library and created API endpoints for RSI, MACD, Bollinger Bands, and EMA.
- Implemented OpenAI-powered trading signal generation (BUY/SELL/HOLD) with confidence scores and reasoning based on technical indicators.
- Implemented JWT authentication for user registration and login.
- Added server-side subscription tier enforcement for API endpoints (free, pro, enterprise).
- Integrated Stripe checkout for Pro and Enterprise subscriptions, including session creation and webhook handling.
- Developed a 30-day backtesting engine with win rate, PnL, and Sharpe ratio calculation.
- Implemented the frontend dashboard with Chart.js for price visualization, a live ticker for real-time price updates, and a signal feed for AI-generated trading signals.

## Security & Reliability Improvements
- Added startup validation for required environment variables (JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, OPENAI_API_KEY) — server now exits early with a clear error instead of crashing at runtime.
- Configured CORS to restrict to the allowed frontend origin (`ALLOWED_ORIGIN` env var, defaults to `http://localhost:3000`) instead of allowing all origins.
- Added `helmet` middleware for standard HTTP security headers.
- Added `express-rate-limit` on `/api/register` and `/api/login` (100 requests per 15 min per IP) to mitigate brute-force attacks.
- Added input length validation on registration (username 3–64 chars, password 8–128 chars).
- Refactored `/api/signal/:coinId` to call a shared `computeIndicators()` helper directly, eliminating the fragile self-referencing HTTP call.
- Fixed missing `COINS` constant in `frontend/public/dashboard.js` that caused a `ReferenceError` at runtime.

## Tests
- Added `tests/scoring.test.mjs` with 10 tests covering `calculateScore`, `groupByCategory`, and `primaryFocusCategory` from `lib/scoring.mjs`.
- Created `lib/scoring.mjs` (JS mirror of `lib/scoring.ts`) so the plain Node.js test runner can import it without a TypeScript build step.
