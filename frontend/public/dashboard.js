document.addEventListener("DOMContentLoaded", () => {
    const backendUrl = "http://localhost:5000"; // Your backend URL
    const liveTickerDiv = document.getElementById("live-ticker");
    const signalFeedDiv = document.getElementById("signal-feed");
    const backtestingResultsDiv = document.getElementById("backtesting-results");
    const priceChartCanvas = document.getElementById("priceChart");
    let priceChart;

    // Dummy token for testing - replace with actual login flow
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsInN1YnNjcmlwdGlvblRpZXIiOiJlbnRlcnByaXNlIiwiaWF0IjoxNzA1NzU2ODAwLCJleHAiOjE3MDU3NjA0MDB9.YOUR_DUMMY_TOKEN_HERE"; 

    const fetchWithAuth = async (url) => {
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    };

    // Function to update live ticker
    const updateLiveTicker = async () => {
        try {
            const prices = await fetchWithAuth(`${backendUrl}/api/prices`);
            liveTickerDiv.innerHTML = "";
            prices.forEach(coin => {
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

    // Function to render price chart
    const renderPriceChart = async (coinId = "bitcoin") => {
        try {
            const historicalData = await fetchWithAuth(`${backendUrl}/api/indicators/${coinId}`); // Reusing indicators endpoint for historical prices
            const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`); // Dummy labels for 30 days
            const data = historicalData.prices; // Assuming prices are returned in the indicators endpoint

            if (priceChart) {
                priceChart.destroy();
            }

            priceChart = new Chart(priceChartCanvas, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${SYMBOLS[coinId]} Price (USD)`,
                        data: data,
                        borderColor: "#7c3aed",
                        backgroundColor: "rgba(124, 58, 237, 0.2)",
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: { color: "rgba(255,255,255,0.1)" },
                            ticks: { color: "#9ca3af" }
                        },
                        y: {
                            grid: { color: "rgba(255,255,255,0.1)" },
                            ticks: { color: "#9ca3af" }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        } catch (error) {
            console.error("Error rendering price chart:", error);
            priceChartCanvas.innerHTML = `<p class="text-red-500">Failed to load chart data: ${error.message}</p>`;
        }
    };

    // Function to update AI signal feed
    const updateSignalFeed = async () => {
        try {
            // Fetch signals for all coins
            const signals = await Promise.all(COINS.map(coinId => 
                fetchWithAuth(`${backendUrl}/api/signal/${coinId}`).catch(e => null) // Handle individual coin errors
            ));

            signalFeedDiv.innerHTML = "";
            signals.forEach((signal, index) => {
                if (signal) {
                    const coinSymbol = SYMBOLS[COINS[index]];
                    const signalColor = signal.signal === "BUY" ? "text-green-500" : signal.signal === "SELL" ? "text-red-500" : "text-yellow-500";
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
                }
            });
        } catch (error) {
            console.error("Error fetching AI signals:", error);
            signalFeedDiv.innerHTML = `<p class="text-red-500">Failed to load signals: ${error.message}</p>`;
        }
    };

    // Function to display backtesting results
    const displayBacktestingResults = async (coinId = "bitcoin") => {
        try {
            const results = await fetchWithAuth(`${backendUrl}/api/backtest/${coinId}`);
            backtestingResultsDiv.innerHTML = `
                <p><strong>Coin:</strong> ${results.coinId.toUpperCase()}</p>
                <p><strong>Period:</strong> ${results.backtestPeriod}</p>
                <p><strong>Total PnL:</strong> $${results.totalPnL.toFixed(2)}</p>
                <p><strong>Win Rate:</strong> ${results.winRate.toFixed(2)}%</p>
                <p><strong>Sharpe Ratio:</strong> ${results.sharpeRatio.toFixed(2)}</p>
                <h4 class="font-semibold mt-4">Trades:</h4>
                <ul class="list-disc list-inside">
                    ${results.trades.map(trade => `<li>${trade.type} at $${trade.price.toFixed(2)} on ${new Date(trade.date).toLocaleDateString()} ${trade.profit ? `(Profit: $${trade.profit.toFixed(2)})` : ``}</li>`).join("")}
                </ul>
            `;
        } catch (error) {
            console.error("Error fetching backtesting results:", error);
            backtestingResultsDiv.innerHTML = `<p class="text-red-500">Failed to load backtesting results: ${error.message}</p>`;
        }
    };

    // Initial calls and set intervals
    updateLiveTicker();
    renderPriceChart();
    updateSignalFeed();
    displayBacktestingResults(); // Display for a default coin

    setInterval(updateLiveTicker, 10000); // Update every 10 seconds
    setInterval(updateSignalFeed, 30000); // Update every 30 seconds

    // Logout functionality
    document.getElementById("logout-btn").addEventListener("click", () => {
        // Clear token and redirect to login page (implement actual login page later)
        localStorage.removeItem("jwtToken");
        alert("Logged out!");
        // window.location.href = "/login.html"; 
    });
});

// Define SYMBOLS globally or pass them if needed in other scripts
const SYMBOLS = {
    "bitcoin": "BTC",
    "ethereum": "ETH",
    "solana": "SOL",
    "binancecoin": "BNB",
    "cardano": "ADA",
    "ripple": "XRP"
};
