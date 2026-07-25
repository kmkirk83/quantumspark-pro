const test = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";

const app = require("../app");

function startTestServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`,
      });
    });
  });
}

test("root endpoint returns API status", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await fetch(baseUrl);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "QuantumSpark Pro API is running...");
  } finally {
    server.close();
  }
});

test("register and login issue an access token", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const username = `tester-${Date.now()}`;
    const password = "supersafe-password";

    const registerResponse = await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    assert.equal(registerResponse.status, 201);
    const registerBody = await registerResponse.json();
    assert.equal(registerBody.user.username, username);
    assert.equal(registerBody.user.subscriptionTier, "free");

    const loginResponse = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    assert.equal(loginResponse.status, 200);
    const loginBody = await loginResponse.json();
    assert.equal(typeof loginBody.accessToken, "string");
    assert.ok(loginBody.accessToken.length > 20);
  } finally {
    server.close();
  }
});

test("protected prices endpoint rejects unauthenticated requests", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await fetch(`${baseUrl}/api/prices`);
    assert.equal(response.status, 401);
  } finally {
    server.close();
  }
});

test("checkout session rejects unsupported tiers before Stripe calls", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const username = `billing-${Date.now()}`;
    const password = "supersafe-password";

    await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const loginResponse = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const { accessToken } = await loginResponse.json();

    const response = await fetch(`${baseUrl}/api/create-checkout-session`, {
      method: "POST",
      headers: {
        Authorization: ["Bearer", accessToken].join(" "),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tier: "starter" }),
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Invalid subscription tier" });
  } finally {
    server.close();
  }
});
