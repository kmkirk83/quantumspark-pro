import { clearStoredToken, getBackendUrl, getStoredToken } from "./session.js";

export class ApiError extends Error {
    constructor(message, status, details = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const message = typeof payload === "object" && payload !== null
            ? payload.message || payload.error || `Request failed with status ${response.status}`
            : payload || `Request failed with status ${response.status}`;
        throw new ApiError(message, response.status, payload);
    }

    return payload;
}

export async function apiRequest(pathname, options = {}) {
    const {
        method = "GET",
        body,
        auth = true,
        headers = {},
        backendUrl = getBackendUrl(),
    } = options;

    const requestHeaders = { ...headers };

    if (body !== undefined) {
        requestHeaders["Content-Type"] = "application/json";
    }

    if (auth) {
        const token = getStoredToken();

        if (!token) {
            throw new ApiError("Please sign in to continue.", 401);
        }

        requestHeaders.Authorization = "Bearer " + token;
    }

    try {
        const response = await fetch(`${backendUrl}${pathname}`, {
            method,
            headers: requestHeaders,
            body: body === undefined ? undefined : JSON.stringify(body),
        });

        return await parseResponse(response);
    } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            clearStoredToken();
        }

        throw error;
    }
}
