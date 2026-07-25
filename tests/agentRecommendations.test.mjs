import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import ts from "typescript";

const sourcePath = fileURLToPath(
  new URL("../lib/agentRecommendations.ts", import.meta.url)
);

async function loadRecommendationsModule() {
  const source = await readFile(sourcePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const tempDirectory = await mkdtemp(join(tmpdir(), "agent-recommendations-"));
  const modulePath = join(tempDirectory, "agentRecommendations.mjs");
  tempDirectories.push(tempDirectory);

  await writeFile(modulePath, outputText, "utf8");

  moduleVersion += 1;
  return import(`${pathToFileURL(modulePath).href}?t=${moduleVersion}`);
}

const tempDirectories = [];
let moduleVersion = 0;
const recommendationsModule = await loadRecommendationsModule();

test.after(async () => {
  await Promise.all(
    tempDirectories.map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  );
});

test("getRecommendationsForTarget returns ranked matches for backend", () => {
  const recommendations = recommendationsModule.getRecommendationsForTarget(
    "backend"
  );

  assert.ok(recommendations.length > 0);
  assert.equal(recommendations[0].name, "Sonar");
  assert.deepEqual(
    recommendations.map((recommendation) => recommendation.rank),
    [...recommendations]
      .map((recommendation) => recommendation.rank)
      .sort((left, right) => left - right)
  );
});

test("filterRecommendations narrows recommendations by focus", () => {
  const recommendations = recommendationsModule.filterRecommendations(
    "app",
    "security"
  );

  assert.deepEqual(
    recommendations.map((recommendation) => recommendation.name),
    ["Endor Labs", "Bright Security"]
  );
});

test("getTopRecommendation falls back to the best overall option", () => {
  const recommendation = recommendationsModule.getTopRecommendation("frontend");

  assert.equal(recommendation.name, "Sonar");
  assert.equal(recommendation.rank, 1);
});
