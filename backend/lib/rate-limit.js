function createRateLimit({ windowMs, max, message = "Too many requests. Please try again later." }) {
    const buckets = new Map();

    return (req, res, next) => {
        const routeKey = req.route?.path || req.path || "*";
        const clientKey = req.ip || req.socket?.remoteAddress || "unknown";
        const key = `${clientKey}:${routeKey}`;
        const now = Date.now();
        const currentWindowStart = now - windowMs;
        const timestamps = (buckets.get(key) || []).filter((timestamp) => timestamp > currentWindowStart);

        if (timestamps.length >= max) {
            return res.status(429).json({ message });
        }

        timestamps.push(now);
        buckets.set(key, timestamps);
        next();
    };
}

module.exports = { createRateLimit };
