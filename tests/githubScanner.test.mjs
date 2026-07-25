import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scannerPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../lib/githubScanner.ts"
);

test("fetchRepoInfo declares headers before authorization assignment", async () => {
  const scannerSource = await readFile(scannerPath, "utf8");
  const fetchRepoInfoStart = scannerSource.indexOf("export async function fetchRepoInfo");
  const fetchLatestWorkflowRunStart = scannerSource.indexOf(
    "export async function fetchLatestWorkflowRun"
  );
  const fetchRepoInfoBlock = scannerSource.slice(fetchRepoInfoStart, fetchLatestWorkflowRunStart);

  const headersDeclarationIndex = fetchRepoInfoBlock.indexOf(
    'const headers: HeadersInit = { Accept: "application/vnd.github+json" };'
  );
  const authAssignmentIndex = fetchRepoInfoBlock.indexOf('headers["Authorization"] = "Bearer " + token;');

  assert.notEqual(headersDeclarationIndex, -1, "Expected headers declaration in fetchRepoInfo");
  assert.notEqual(authAssignmentIndex, -1, "Expected Authorization assignment in fetchRepoInfo");
  assert.ok(
    headersDeclarationIndex < authAssignmentIndex,
    "Expected headers declaration before Authorization assignment"
  );
});
