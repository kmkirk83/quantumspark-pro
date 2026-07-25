export const TOKEN_STORAGE_KEY = "jwtToken";
export const DEFAULT_BACKEND_URL = "http://localhost:5000";

function getStorage(storage = globalThis.localStorage) {
    return storage ?? null;
}

export function getStoredToken(storage = globalThis.localStorage) {
    return getStorage(storage)?.getItem(TOKEN_STORAGE_KEY) ?? "";
}

export function storeToken(token, storage = globalThis.localStorage) {
    const normalizedToken = String(token || "").trim();

    if (!normalizedToken) {
        throw new Error("A token is required to start a session.");
    }

    getStorage(storage)?.setItem(TOKEN_STORAGE_KEY, normalizedToken);
    return normalizedToken;
}

export function clearStoredToken(storage = globalThis.localStorage) {
    getStorage(storage)?.removeItem(TOKEN_STORAGE_KEY);
}

export function getBackendUrl(configuration = globalThis) {
    return configuration?.QUANTUMSPARK_BACKEND_URL || DEFAULT_BACKEND_URL;
}
