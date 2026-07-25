import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import ts from "typescript";

const sourcePath = fileURLToPath(
  new URL("../lib/recommendationService.ts", import.meta.url)
);
const agentRecommendationsPath = fileURLToPath(
  new URL("../lib/agentRecommendations.ts", import.meta.url)
);

const tempDirectories = [];
let moduleVersion = 0;
let recommendationService;

async function transpileModule(sourceFile, outputFile) {
  const source = await readFile(sourceFile, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });

  await writeFile(outputFile, outputText, "utf8");
}

async function loadRecommendationService() {
  const tempDirectory = await mkdtemp(join(tmpdir(), "recommendation-service-"));
  tempDirectories.push(tempDirectory);
  const recommendationsOutputPath = join(tempDirectory, "agentRecommendations.mjs");
  const serviceOutputPath = join(tempDirectory, "recommendationService.mjs");

  await transpileModule(agentRecommendationsPath, recommendationsOutputPath);

  const source = await readFile(sourcePath, "utf8");
  const rewrittenSource = source
    .replaceAll('from "@/lib/agentRecommendations"', 'from "./agentRecommendations.mjs"')
    .replaceAll('import type { ScanResult } from "@/lib/githubScanner";', "");
  const { outputText } = ts.transpileModule(rewrittenSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });

  await writeFile(serviceOutputPath, outputText, "utf8");

  moduleVersion += 1;
  return import(`${pathToFileURL(serviceOutputPath).href}?t=${moduleVersion}`);
}

test.before(async () => {
  recommendationService = await loadRecommendationService();
});

test.after(async () => {
  await Promise.all(
    tempDirectories.map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  );
});

test("parseTargets defaults to whole repo when empty", () => {
  assert.deepEqual(recommendationService.parseTargets(null), ["whole-repo"]);
  assert.deepEqual(recommendationService.parseTargets(""), ["whole-repo"]);
});

test("parseTargets keeps valid unique repo targets in supported order", () => {
  assert.deepEqual(
    recommendationService.parseTargets("backend,frontend,backend,app"),
    ["frontend", "backend", "app"]
  );
});

test("validateRepositoryParameters trims valid repository coordinates", () => {
  assert.deepEqual(
    recommendationService.validateRepositoryParameters(" vercel ", " next.js "),
    {
      owner: "vercel",
      repo: "next.js",
    }
  );
});

test("validateRepositoryParameters rejects partial coordinates", () => {
  assert.deepEqual(
    recommendationService.validateRepositoryParameters("vercel", null),
    {
      error: "owner and repo must be provided together",
    }
  );
});

test("validateRepositoryParameters rejects invalid owner names", () => {
  assert.deepEqual(
    recommendationService.validateRepositoryParameters("-vercel", "next.js"),
    {
      error: "owner contains invalid characters",
    }
  );
});

test("validateRepositoryParameters rejects owner names that end with hyphens", () => {
  assert.deepEqual(
    recommendationService.validateRepositoryParameters("vercel-", "next.js"),
    {
      error: "owner contains invalid characters",
    }
  );
});

test("validateRepositoryParameters rejects invalid repo names", () => {
  assert.deepEqual(
    recommendationService.validateRepositoryParameters("vercel", "next/js"),
    {
      error: "repo contains invalid characters",
    }
  );
});

test("buildRecommendationPayload returns top picks per target", () => {
  const payload = recommendationService.buildRecommendationPayload({
    focus: "security",
    targets: ["backend", "app"],
  });

  assert.equal(payload.repository, null);
  assert.equal(payload.recommendations[0].target, "backend");
  assert.equal(payload.recommendations[0].topRecommendation.name, "Endor Labs");
  assert.deepEqual(
    payload.recommendations[1].recommendations.map((item) => item.name),
    ["Endor Labs", "Bright Security"]
  );
});
