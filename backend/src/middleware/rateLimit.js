const requests = new Map();

function rateLimit({ windowMs = 60_000, maxRequests = 30 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const entry = requests.get(key);

    if (!entry || now - entry.windowStart >= windowMs) {
      requests.set(key, {
        count: 1,
        windowStart: now,
      });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    entry.count += 1;
    return next();
  };
}

module.exports = {
  rateLimit,
};
