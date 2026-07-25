import { apiRequest } from "./lib/api.js";
import { getStoredToken } from "./lib/session.js";

const successState = document.getElementById("success-state");
const searchParams = new URLSearchParams(window.location.search);
const sessionId = searchParams.get("session_id");
const SESSION_ID_PATTERN = /^cs_(test_|live_)?[A-Za-z0-9_]+$/;

function render(message) {
    successState.innerHTML = message;
}

async function loadSession() {
    if (!sessionId) {
        render('<p class="text-red-300">Missing checkout session id. Start again from the account page.</p>');
        return;
    }

    if (!SESSION_ID_PATTERN.test(sessionId)) {
        render('<p class="text-red-300">The checkout session id is malformed. Start again from the account page.</p>');
        return;
    }

    if (!getStoredToken()) {
        render('<p class="text-red-300">Your local session ended before checkout finished. Sign in again on the account page to verify this purchase.</p>');
        return;
    }

    try {
        const response = await apiRequest(`/api/checkout-session/${encodeURIComponent(sessionId)}`);
        const tier = response.user?.subscriptionTier || response.checkoutSession.tier || "pending";
        const paymentStatus = response.checkoutSession.paymentStatus || "pending";
        const sessionStatus = response.checkoutSession.status || "open";

        render(`
            <p class="text-sm uppercase tracking-[0.2em] text-gray-400">Verified session</p>
            <p class="mt-3 text-2xl font-semibold text-white">${response.user?.username || "Account updated"}</p>
            <p class="mt-3 text-gray-300">Subscription tier: <span class="font-semibold text-white">${tier}</span></p>
            <p class="mt-2 text-gray-400">Stripe session status: ${sessionStatus}</p>
            <p class="mt-2 text-gray-400">Payment status: ${paymentStatus}</p>
        `);
    } catch (error) {
        render(`<p class="text-red-300">${error.message}</p>`);
    }
}

loadSession();
