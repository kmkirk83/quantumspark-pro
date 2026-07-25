const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildCheckoutCancelUrl,
    buildCheckoutSuccessUrl,
    canUpgradeToTier,
    isCheckoutSessionOwner,
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
    assert.equal(canUpgradeToTier("free", "pro"), true);
    assert.equal(canUpgradeToTier("enterprise", "pro"), false);
    assert.equal(isCheckoutSessionOwner({ metadata: { userId: "3" } }, 3), true);
    assert.equal(isCheckoutSessionOwner({ metadata: { userId: "3" } }, 4), false);
});
