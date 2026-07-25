const test = require("node:test");
const assert = require("node:assert/strict");

const { createRateLimit } = require("../lib/rate-limit");

test("createRateLimit allows requests under the limit", () => {
    const middleware = createRateLimit({ windowMs: 1000, max: 2 });
    const req = { ip: "127.0.0.1", path: "/api/me", route: { path: "/api/me" } };
    const res = {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json() {
            throw new Error("json should not be called before the limit is reached");
        },
    };
    let nextCalls = 0;

    middleware(req, res, () => {
        nextCalls += 1;
    });
    middleware(req, res, () => {
        nextCalls += 1;
    });

    assert.equal(nextCalls, 2);
});

test("createRateLimit blocks requests that exceed the limit", () => {
    const middleware = createRateLimit({ windowMs: 1000, max: 1, message: "Slow down" });
    const req = { ip: "127.0.0.1", path: "/api/checkout-session/123", route: { path: "/api/checkout-session/:sessionId" } };
    let payload = null;
    const res = {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            payload = body;
            return body;
        },
    };

    middleware(req, res, () => {});
    middleware(req, res, () => {});

    assert.equal(res.statusCode, 429);
    assert.deepEqual(payload, { message: "Slow down" });
});
