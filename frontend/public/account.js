import { ApiError, apiRequest } from "./lib/api.js";
import { clearStoredToken, getStoredToken, storeToken } from "./lib/session.js";

const authForm = document.getElementById("auth-form");
const authStatus = document.getElementById("auth-status");
const authSubmit = document.getElementById("auth-submit");
const sessionSummary = document.getElementById("session-summary");
const logoutButton = document.getElementById("logout-btn");
const upgradeButtons = {
    pro: document.getElementById("upgrade-pro"),
    enterprise: document.getElementById("upgrade-enterprise"),
};
const tabs = {
    login: document.getElementById("login-tab"),
    register: document.getElementById("register-tab"),
};

let mode = "login";
let currentUser = null;

function setStatus(message, tone = "text-gray-400") {
    authStatus.textContent = message;
    authStatus.className = `mt-4 min-h-6 text-sm ${tone}`;
}

function setMode(nextMode) {
    mode = nextMode;
    authSubmit.textContent = nextMode === "login" ? "Login" : "Register & start session";

    Object.entries(tabs).forEach(([tabMode, button]) => {
        const isActive = tabMode === nextMode;
        button.className = isActive
            ? "rounded-full bg-quantumPurple px-4 py-2 font-semibold text-white"
            : "rounded-full px-4 py-2 font-semibold text-gray-300";
    });

    setStatus(nextMode === "login" ? "Use an existing account to continue." : "Create an account to unlock checkout sessions.");
}

function setUpgradeState(user) {
    const tier = user?.subscriptionTier || "free";
    const disablePro = !user || tier === "pro" || tier === "enterprise";
    const disableEnterprise = !user || tier === "enterprise";

    upgradeButtons.pro.disabled = disablePro;
    upgradeButtons.enterprise.disabled = disableEnterprise;
    logoutButton.disabled = !user;
}

function renderSessionSummary(user) {
    currentUser = user;

    if (!user) {
        sessionSummary.innerHTML = '<p class="text-sm text-gray-400">No active session.</p>';
        setUpgradeState(null);
        return;
    }

    sessionSummary.innerHTML = `
        <p class="text-sm uppercase tracking-[0.2em] text-gray-400">Signed in</p>
        <p class="mt-3 text-2xl font-semibold text-white">${user.username}</p>
        <p class="mt-2 text-sm text-gray-400">Current subscription: <span class="font-semibold text-white">${user.subscriptionTier}</span></p>
    `;
    setUpgradeState(user);
}

async function loadCurrentUser() {
    if (!getStoredToken()) {
        renderSessionSummary(null);
        setStatus("Sign in to manage subscription sessions.");
        return;
    }

    try {
        const response = await apiRequest("/api/me");
        renderSessionSummary(response.user);
        setStatus(`Active session restored for ${response.user.username}.`, "text-emerald-300");
    } catch (error) {
        renderSessionSummary(null);
        setStatus(error.message, "text-red-300");
    }
}

async function submitAuthForm(event) {
    event.preventDefault();
    const formData = new FormData(authForm);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (!username || !password) {
        setStatus("Username and password are required.", "text-red-300");
        return;
    }

    try {
        const isRegisterMode = mode === "register";

        if (mode === "register") {
            await apiRequest("/api/register", {
                method: "POST",
                auth: false,
                body: { username, password },
            });
        }

        const loginResponse = await apiRequest("/api/login", {
            method: "POST",
            auth: false,
            body: { username, password },
        });

        storeToken(loginResponse.accessToken);
        authForm.reset();
        setMode("login");
        await loadCurrentUser();
        setStatus(isRegisterMode ? "Account created and session started successfully." : "Session started successfully.", "text-emerald-300");
    } catch (error) {
        setStatus(error.message, "text-red-300");
    }
}

async function beginUpgrade(tier) {
    if (!currentUser) {
        setStatus("Sign in before starting a checkout session.", "text-red-300");
        return;
    }

    try {
        const response = await apiRequest("/api/create-checkout-session", {
            method: "POST",
            body: { tier },
        });

        if (!response.url) {
            throw new ApiError("Checkout session did not return a redirect URL.", 500);
        }

        window.location.href = response.url;
    } catch (error) {
        setStatus(error.message, "text-red-300");
    }
}

Object.entries(tabs).forEach(([tabMode, button]) => {
    button.addEventListener("click", () => setMode(tabMode));
});

authForm.addEventListener("submit", submitAuthForm);
logoutButton.addEventListener("click", () => {
    clearStoredToken();
    renderSessionSummary(null);
    setStatus("Session cleared.", "text-gray-300");
});
upgradeButtons.pro.addEventListener("click", () => beginUpgrade("pro"));
upgradeButtons.enterprise.addEventListener("click", () => beginUpgrade("enterprise"));

setMode("login");
loadCurrentUser();
