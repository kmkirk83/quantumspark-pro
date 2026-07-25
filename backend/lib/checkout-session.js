const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_PRO_PRICE_ID = "price_12345";
const DEFAULT_ENTERPRISE_PRICE_ID = "price_67890";
const TIER_ORDER = { free: 0, pro: 1, enterprise: 2 };

function normalizeAppUrl(baseUrl = DEFAULT_APP_URL) {
    return String(baseUrl || DEFAULT_APP_URL).replace(/\/+$/, "");
}

function buildAppUrl(baseUrl, pathname = "/") {
    const normalizedBaseUrl = normalizeAppUrl(baseUrl);
    const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

    return `${normalizedBaseUrl}${normalizedPathname}`;
}

function buildCheckoutSuccessUrl(baseUrl) {
    return `${buildAppUrl(baseUrl, "/success.html")}?session_id={CHECKOUT_SESSION_ID}`;
}

function buildCheckoutCancelUrl(baseUrl) {
    return buildAppUrl(baseUrl, "/cancel.html");
}

function getPriceIdForTier(tier, env = process.env) {
    if (tier === "pro") {
        return env.STRIPE_PRO_PRICE_ID || (env.NODE_ENV === "production" ? null : DEFAULT_PRO_PRICE_ID);
    }

    if (tier === "enterprise") {
        return env.STRIPE_ENTERPRISE_PRICE_ID || (env.NODE_ENV === "production" ? null : DEFAULT_ENTERPRISE_PRICE_ID);
    }

    return null;
}

function getPublicUser(user) {
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        username: user.username,
        subscriptionTier: user.subscriptionTier,
    };
}

function userHasRequiredTier(userTier, requiredTier) {
    return (TIER_ORDER[userTier] ?? -1) >= (TIER_ORDER[requiredTier] ?? Number.MAX_SAFE_INTEGER);
}

function canUpgradeToTier(currentTier, requestedTier) {
    return (TIER_ORDER[requestedTier] ?? -1) > (TIER_ORDER[currentTier] ?? -1);
}

function syncSubscriptionFromCheckoutSession(users, session) {
    if (!Array.isArray(users) || !session) {
        return null;
    }

    const isSuccessful = session.status === "complete" || session.payment_status === "paid";
    const userId = Number.parseInt(session.metadata?.userId, 10);
    const newTier = session.metadata?.tier;

    if (!isSuccessful || !Number.isInteger(userId) || !TIER_ORDER[newTier]) {
        return null;
    }

    const user = users.find((candidate) => candidate.id === userId);

    if (!user) {
        return null;
    }

    user.subscriptionTier = newTier;
    return user;
}

function isCheckoutSessionOwner(session, userId) {
    return Number.parseInt(session?.metadata?.userId, 10) === Number(userId);
}

module.exports = {
    buildAppUrl,
    buildCheckoutCancelUrl,
    buildCheckoutSuccessUrl,
    canUpgradeToTier,
    getPriceIdForTier,
    getPublicUser,
    isCheckoutSessionOwner,
    normalizeAppUrl,
    syncSubscriptionFromCheckoutSession,
    userHasRequiredTier,
};
