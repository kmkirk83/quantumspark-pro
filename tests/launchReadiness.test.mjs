import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import ts from "typescript";

const sourcePath = fileURLToPath(
  new URL("../lib/launchReadiness.ts", import.meta.url)
);

async function loadLaunchReadiness() {
  const source = await readFile(sourcePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const tempDirectory = await mkdtemp(join(tmpdir(), "launch-readiness-"));
  const modulePath = join(tempDirectory, "launchReadiness.mjs");

  await writeFile(modulePath, outputText, "utf8");

  return import(`${pathToFileURL(modulePath).href}?t=${Date.now()}`);
}

const launchReadiness = await loadLaunchReadiness();

test("launch recommendations expose the audited launch blockers", () => {
  assert.equal(launchReadiness.launchRecommendations.length, 4);
  assert.deepEqual(
    launchReadiness.launchRecommendations.map((item) => item.id),
    [
      "persistent-auth",
      "payments-config",
      "dashboard-contracts",
      "release-guardrails",
    ]
  );
});

test("calculateLaunchScore returns 0 when nothing is complete", () => {
  assert.equal(launchReadiness.calculateLaunchScore([]), 0);
});

test("calculateLaunchScore weights critical blockers more heavily", () => {
  assert.equal(
    launchReadiness.calculateLaunchScore([
      "persistent-auth",
      "dashboard-contracts",
    ]),
    47
  );
});

test("countBySeverity returns the repository blocker counts", () => {
  assert.deepEqual(
    launchReadiness.countBySeverity(launchReadiness.launchRecommendations),
    {
      Critical: 2,
      High: 2,
      Medium: 0,
    }
  );
});

test("primaryLaunchFocus prefers unresolved weighted categories", () => {
  assert.equal(
    launchReadiness.primaryLaunchFocus(
      launchReadiness.launchRecommendations,
      ["persistent-auth", "release-guardrails"]
    ),
    "Security"
  );
});
