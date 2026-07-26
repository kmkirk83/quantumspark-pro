import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import ts from "typescript";

const sourcePath = fileURLToPath(
  new URL("../lib/githubScanner.ts", import.meta.url)
);

async function loadGitHubScanner() {
  const source = await readFile(sourcePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const tempDirectory = await mkdtemp(join(tmpdir(), "github-scanner-"));
  const modulePath = join(tempDirectory, "githubScanner.mjs");

  await writeFile(modulePath, outputText, "utf8");

  return import(`${pathToFileURL(modulePath).href}?t=${Date.now()}`);
}

const githubScanner = await loadGitHubScanner();

function stubFetch(implementation) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = implementation;

  return () => {
    globalThis.fetch = originalFetch;
  };
}

test("fetchRepoInfo sends GitHub headers and returns repo info", async () => {
  const token = "token-" + "123";
  const expectedRepo = {
    name: "repo",
    full_name: "owner/repo",
    description: "Repository description",
    stargazers_count: 42,
    open_issues_count: 3,
    has_issues: true,
    default_branch: "main",
    updated_at: "2026-07-25T00:00:00Z",
  };
  let requestUrl;
  let requestInit;
  const restoreFetch = stubFetch(async (url, init) => {
    requestUrl = url;
    requestInit = init;

    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => expectedRepo,
    };
  });

  try {
    const repoInfo = await githubScanner.fetchRepoInfo(
      "owner name",
      "repo/name",
      token
    );

    assert.deepEqual(repoInfo, expectedRepo);
    assert.equal(
      requestUrl,
      "https://api.github.com/repos/owner%20name/repo%2Fname"
    );
    assert.deepEqual(requestInit?.headers, {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
    });
    assert.deepEqual(requestInit?.next, { revalidate: 60 });
  } finally {
    restoreFetch();
  }
});

test("fetchLatestWorkflowRun returns null when the API response is not ok", async () => {
  let requestInit;
  const restoreFetch = stubFetch(async (_url, init) => {
    requestInit = init;

    return {
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: async () => ({ workflow_runs: [] }),
    };
  });

  try {
    const latestRun = await githubScanner.fetchLatestWorkflowRun("owner", "repo");

    assert.equal(latestRun, null);
    assert.deepEqual(requestInit?.headers, {
      Accept: "application/vnd.github+json",
    });
  } finally {
    restoreFetch();
  }
});

test("scanRepository reports CI success from the latest workflow run", async () => {
  const responses = [
    {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        name: "repo",
        full_name: "owner/repo",
        description: null,
        stargazers_count: 5,
        open_issues_count: 7,
        has_issues: true,
        default_branch: "main",
        updated_at: "2026-07-25T00:00:00Z",
      }),
    },
    {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        workflow_runs: [
          {
            id: 99,
            name: "QuantumSpark CI",
            status: "completed",
            conclusion: "success",
            created_at: "2026-07-25T00:00:00Z",
            updated_at: "2026-07-25T00:01:00Z",
            html_url: "https://github.com/example/actions/runs/99",
          },
        ],
      }),
    },
  ];
  const restoreFetch = stubFetch(async () => responses.shift());

  try {
    const result = await githubScanner.scanRepository("owner", "repo", "token-123");

    assert.equal(result.ciPassing, true);
    assert.equal(result.openIssues, 7);
    assert.equal(result.latestRun?.id, 99);
  } finally {
    restoreFetch();
  }
});
