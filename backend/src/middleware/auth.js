const jwt = require("jsonwebtoken");

const { getJwtSecret } = require("../config");
const { findUserById } = require("../users");

const TIER_ORDER = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  let secret;
  try {
    secret = getJwtSecret();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  return jwt.verify(token, secret, (error, user) => {
    if (error) {
      return res.sendStatus(403);
    }

    req.user = user;
    return next();
  });
}

function authorizeTier(requiredTier) {
  return (req, res, next) => {
    const user = findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (TIER_ORDER[user.subscriptionTier] >= TIER_ORDER[requiredTier]) {
      return next();
    }

    return res.status(403).json({ message: `Access denied. Requires ${requiredTier} subscription.` });
  };
}

module.exports = {
  authenticateToken,
  authorizeTier,
};
