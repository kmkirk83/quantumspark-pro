import test from "node:test";
import assert from "node:assert/strict";

import {
  fetchLatestWorkflowRun,
  fetchRepoInfo,
  scanRepository,
} from "../lib/githubScanner.ts";

test("fetchRepoInfo includes the GitHub auth header when a token is provided", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, options) => {
    assert.equal(
      url,
      "https://api.github.com/repos/kmkirk83/quantumspark-pro"
    );
    assert.equal(typeof options.headers.Authorization, "string");

    return {
      ok: true,
      json: async () => ({
        name: "quantumspark-pro",
        full_name: "kmkirk83/quantumspark-pro",
        description: "Repo description",
        stargazers_count: 1,
        open_issues_count: 2,
        has_issues: true,
        default_branch: "main",
        updated_at: "2026-07-25T00:00:00.000Z",
      }),
    };
  };

  try {
    const repo = await fetchRepoInfo("kmkirk83", "quantumspark-pro", "test-token");
    assert.equal(repo.full_name, "kmkirk83/quantumspark-pro");
    assert.equal(repo.open_issues_count, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchLatestWorkflowRun returns null when the GitHub API request fails", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 503,
    statusText: "Service Unavailable",
  });

  try {
    const run = await fetchLatestWorkflowRun("kmkirk83", "quantumspark-pro");
    assert.equal(run, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("scanRepository marks ciPassing when the latest workflow run succeeded", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url) => {
    if (url.includes("/actions/runs")) {
      return {
        ok: true,
        json: async () => ({
          workflow_runs: [
            {
              id: 99,
              name: "QuantumSpark CI",
              status: "completed",
              conclusion: "success",
              created_at: "2026-07-25T00:00:00.000Z",
              updated_at: "2026-07-25T00:05:00.000Z",
              html_url: "https://github.com/kmkirk83/quantumspark-pro/actions/runs/99",
            },
          ],
        }),
      };
    }

    return {
      ok: true,
      json: async () => ({
        name: "quantumspark-pro",
        full_name: "kmkirk83/quantumspark-pro",
        description: "Repo description",
        stargazers_count: 1,
        open_issues_count: 4,
        has_issues: true,
        default_branch: "main",
        updated_at: "2026-07-25T00:00:00.000Z",
      }),
    };
  };

  try {
    const result = await scanRepository("kmkirk83", "quantumspark-pro");
    assert.equal(result.ciPassing, true);
    assert.equal(result.openIssues, 4);
    assert.equal(result.latestRun?.id, 99);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
