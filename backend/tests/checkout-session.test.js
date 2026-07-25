const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildCheckoutCancelUrl,
    buildCheckoutSuccessUrl,
    canUpgradeToTier,
    getPriceIdForTier,
    isCheckoutSessionOwner,
    isValidCheckoutSessionId,
    syncSubscriptionFromCheckoutSession,
    userHasRequiredTier,
} = require("../lib/checkout-session");

test("buildCheckoutSuccessUrl normalizes trailing slashes", () => {
    assert.equal(
        buildCheckoutSuccessUrl("https://quantumspark.dev/"),
        "https://quantumspark.dev/success.html?session_id={CHECKOUT_SESSION_ID}"
    );
    assert.equal(buildCheckoutCancelUrl("https://quantumspark.dev"), "https://quantumspark.dev/cancel.html");
});

test("syncSubscriptionFromCheckoutSession upgrades the matching user", () => {
    const users = [{ id: 7, username: "alex", subscriptionTier: "free" }];
    const updatedUser = syncSubscriptionFromCheckoutSession(users, {
        status: "complete",
        payment_status: "paid",
        metadata: { userId: "7", tier: "enterprise" },
    });

    assert.equal(updatedUser?.subscriptionTier, "enterprise");
    assert.equal(users[0].subscriptionTier, "enterprise");
});

test("tier helpers enforce access and upgrade direction", () => {
    assert.equal(userHasRequiredTier("enterprise", "pro"), true);
    assert.equal(userHasRequiredTier("free", "pro"), false);
    assert.throws(() => userHasRequiredTier("free", "vip"), /Unknown required tier/);
    assert.equal(canUpgradeToTier("free", "pro"), true);
    assert.equal(canUpgradeToTier("enterprise", "pro"), false);
    assert.equal(isCheckoutSessionOwner({ metadata: { userId: "3" } }, 3), true);
    assert.equal(isCheckoutSessionOwner({ metadata: { userId: "3" } }, 4), false);
    assert.equal(isValidCheckoutSessionId("cs_test_123ABC"), true);
    assert.equal(isValidCheckoutSessionId("cs_test_123_ABC"), false);
});

test("getPriceIdForTier requires configured production price ids", () => {
    assert.throws(
        () => getPriceIdForTier("pro", { NODE_ENV: "production" }),
        /STRIPE_PRO_PRICE_ID/
    );
    assert.equal(
        getPriceIdForTier("enterprise", {
            NODE_ENV: "production",
            STRIPE_ENTERPRISE_PRICE_ID: "price_live_enterprise",
        }),
        "price_live_enterprise"
    );
});
