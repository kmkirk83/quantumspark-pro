import test from "node:test";
import assert from "node:assert/strict";

import {
    DEFAULT_BACKEND_URL,
    TOKEN_STORAGE_KEY,
    clearStoredToken,
    getBackendUrl,
    getStoredToken,
    storeToken,
} from "../public/lib/session.js";

function createStorage() {
    const values = new Map();

    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, value);
        },
        removeItem(key) {
            values.delete(key);
        },
    };
}

test("storeToken persists a trimmed token", () => {
    const storage = createStorage();
    const token = storeToken("  abc123  ", storage);

    assert.equal(token, "abc123");
    assert.equal(storage.getItem(TOKEN_STORAGE_KEY), "abc123");
    assert.equal(getStoredToken(storage), "abc123");
});

test("clearStoredToken removes the current token", () => {
    const storage = createStorage();
    storeToken("session-token", storage);

    clearStoredToken(storage);

    assert.equal(getStoredToken(storage), "");
});

test("getBackendUrl prefers explicit frontend configuration", () => {
    assert.equal(getBackendUrl({ QUANTUMSPARK_BACKEND_URL: "https://api.example.com" }), "https://api.example.com");
    assert.equal(getBackendUrl({}), DEFAULT_BACKEND_URL);
});
