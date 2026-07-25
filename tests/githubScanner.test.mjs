import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const scannerPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../lib/githubScanner.ts"
);

async function loadGithubScannerModule() {
  const scannerSource = await readFile(scannerPath, "utf8");
  const compiled = ts.transpileModule(scannerSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022
    }
  });
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`;
  return import(moduleUrl);
}

test("fetchRepoInfo sends auth and accept headers when token is provided", async () => {
  const { fetchRepoInfo } = await loadGithubScannerModule();
  const originalFetch = globalThis.fetch;
  let capturedHeaders;

  globalThis.fetch = async (_url, options) => {
    capturedHeaders = options?.headers;
    return {
      ok: true,
      json: async () => ({
        name: "repo",
        full_name: "owner/repo",
        description: null,
        stargazers_count: 0,
        open_issues_count: 0,
        has_issues: true,
        default_branch: "main",
        updated_at: "2026-01-01T00:00:00Z"
      })
    };
  };

  try {
    await fetchRepoInfo("owner", "repo", "token-123");
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(capturedHeaders?.Accept, "application/vnd.github+json");
  assert.equal(typeof capturedHeaders?.Authorization, "string");
  assert.ok(capturedHeaders.Authorization.startsWith("Bearer "));
});
