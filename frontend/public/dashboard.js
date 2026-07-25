import { apiRequest } from "./lib/api.js";
import { clearStoredToken, getStoredToken } from "./lib/session.js";

document.addEventListener("DOMContentLoaded", () => {
    const liveTickerDiv = document.getElementById("live-ticker");
    const signalFeedDiv = document.getElementById("signal-feed");
    const backtestingResultsDiv = document.getElementById("backtesting-results");
    const priceChartCanvas = document.getElementById("priceChart");
    let priceChart;
    let isSessionActive = Boolean(getStoredToken());

    const renderLoggedOutState = (message) => {
        const content = `
            <div class="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                ${message} <a href="./account.html" class="font-semibold text-white underline">Open account</a>
            </div>
        `;

        liveTickerDiv.innerHTML = content;
        signalFeedDiv.innerHTML = content;
        backtestingResultsDiv.innerHTML = content;
    };

    const handleSessionError = (error) => {
        if (error.status === 401 || error.status === 403) {
            isSessionActive = false;
            clearStoredToken();
            renderLoggedOutState("Your session expired.");
        }
    };

    const fetchWithAuth = async (path) => {
        if (!isSessionActive) {
            throw new Error("Sign in on the account page before using the dashboard.");
        }

        try {
            return await apiRequest(path);
        } catch (error) {
            handleSessionError(error);
            throw error;
        }
    };

    const updateLiveTicker = async () => {
        try {
            const prices = await fetchWithAuth("/api/prices");
            liveTickerDiv.innerHTML = "";
            prices.forEach((coin) => {
                const changeClass = coin.change24h >= 0 ? "text-green-500" : "text-red-500";
                liveTickerDiv.innerHTML += `
                    <div class="flex justify-between items-center">
                        <span class="text-lg font-semibold">${coin.symbol}</span>
                        <span class="text-lg">$${coin.price.toFixed(2)}</span>
                        <span class="${changeClass}">${coin.change24h ? coin.change24h.toFixed(2) : "0.00"}%</span>
                    </div>
                `;
            });
        } catch (error) {
            console.error("Error fetching live prices:", error);
            liveTickerDiv.innerHTML = `<p class="text-red-500">Failed to load prices: ${error.message}</p>`;
        }
    };

    const renderPriceChart = async (coinId = "bitcoin") => {
        try {
            const indicatorData = await fetchWithAuth(`/api/indicators/${coinId}`);
            const prices = Array.isArray(indicatorData.prices) && indicatorData.prices.length
                ? indicatorData.prices
                : [indicatorData.currentPrice];
            const labels = prices.map((_, index) => `Point ${index + 1}`);

            if (priceChart) {
                priceChart.destroy();
            }

            priceChart = new Chart(priceChartCanvas, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        label: `${SYMBOLS[coinId]} Price (USD)`,
                        data: prices,
                        borderColor: "#7c3aed",
                        backgroundColor: "rgba(124, 58, 237, 0.2)",
                        fill: true,
                        tension: 0.4,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: { color: "rgba(255,255,255,0.1)" },
                            ticks: { color: "#9ca3af" },
                        },
                        y: {
                            grid: { color: "rgba(255,255,255,0.1)" },
                            ticks: { color: "#9ca3af" },
                        },
                    },
                    plugins: {
                        legend: { display: false },
                    },
                },
            });
        } catch (error) {
            console.error("Error rendering price chart:", error);
        }
    };

    const updateSignalFeed = async () => {
        try {
            const signals = await Promise.all(COINS.map((coinId) =>
                fetchWithAuth(`/api/signal/${coinId}`).catch(() => null)
            ));

            signalFeedDiv.innerHTML = "";
            signals.forEach((signal, index) => {
                if (!signal) {
                    return;
                }

                const coinSymbol = SYMBOLS[COINS[index]];
                const signalColor = signal.signal === "BUY"
                    ? "text-green-500"
                    : signal.signal === "SELL"
                        ? "text-red-500"
                        : "text-yellow-500";
                signalFeedDiv.innerHTML += `
                    <div class="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <span class="text-xl font-bold">${coinSymbol}: <span class="${signalColor}">${signal.signal}</span></span>
                            <p class="text-gray-400 text-sm">Confidence: ${signal.confidence}%</p>
                            <p class="text-gray-300 text-sm">Reasoning: ${signal.reasoning}</p>
                        </div>
                        <span class="text-gray-500 text-xs">${new Date().toLocaleTimeString()}</span>
                    </div>
                `;
            });
        } catch (error) {
            console.error("Error fetching AI signals:", error);
            signalFeedDiv.innerHTML = `<p class="text-red-500">Failed to load signals: ${error.message}</p>`;
        }
    };

    const displayBacktestingResults = async (coinId = "bitcoin") => {
        try {
            const results = await fetchWithAuth(`/api/backtest/${coinId}`);
            backtestingResultsDiv.innerHTML = `
                <p><strong>Coin:</strong> ${results.coinId.toUpperCase()}</p>
                <p><strong>Period:</strong> ${results.backtestPeriod}</p>
                <p><strong>Total PnL:</strong> $${results.totalPnL.toFixed(2)}</p>
                <p><strong>Win Rate:</strong> ${results.winRate.toFixed(2)}%</p>
                <p><strong>Sharpe Ratio:</strong> ${results.sharpeRatio.toFixed(2)}</p>
                <h4 class="font-semibold mt-4">Trades:</h4>
                <ul class="list-disc list-inside">
                    ${results.trades.map((trade) => `<li>${trade.type} at $${trade.price.toFixed(2)} on ${new Date(trade.date).toLocaleDateString()} ${trade.profit ? `(Profit: $${trade.profit.toFixed(2)})` : ""}</li>`).join("")}
                </ul>
            `;
        } catch (error) {
            console.error("Error fetching backtesting results:", error);
            backtestingResultsDiv.innerHTML = `<p class="text-red-500">Failed to load backtesting results: ${error.message}</p>`;
        }
    };

    if (!isSessionActive) {
        renderLoggedOutState("No active session.");
    } else {
        updateLiveTicker();
        renderPriceChart();
        updateSignalFeed();
        displayBacktestingResults();

        setInterval(updateLiveTicker, 10000);
        setInterval(updateSignalFeed, 30000);
    }

    document.getElementById("logout-btn").addEventListener("click", () => {
        clearStoredToken();
        isSessionActive = false;
        renderLoggedOutState("Session ended.");
        window.location.href = "./account.html";
    });
});

const SYMBOLS = {
    bitcoin: "BTC",
    ethereum: "ETH",
    solana: "SOL",
    binancecoin: "BNB",
    cardano: "ADA",
    ripple: "XRP",
};

const COINS = Object.keys(SYMBOLS);
