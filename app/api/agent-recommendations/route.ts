import { NextRequest, NextResponse } from "next/server";

import { scanRepository } from "@/lib/githubScanner";
import {
  buildRecommendationPayload,
  buildRepositorySnapshot,
  parseFocus,
  parseTargets,
  validateRepositoryParameters,
} from "@/lib/recommendationService";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const repositoryParameters = validateRepositoryParameters(
    searchParams.get("owner"),
    searchParams.get("repo")
  );
  const focus = parseFocus(searchParams.get("focus"));
  const targets = parseTargets(searchParams.get("targets"));

  if (repositoryParameters.error) {
    console.warn("Invalid agent recommendations request", {
      owner: searchParams.get("owner"),
      repo: searchParams.get("repo"),
      error: repositoryParameters.error,
    });

    return NextResponse.json(
      {
        error: repositoryParameters.error,
      },
      { status: 400 }
    );
  }

  const { owner, repo } = repositoryParameters;

  try {
    const repository =
      owner && repo
        ? buildRepositorySnapshot(
            owner,
            repo,
            await scanRepository(owner, repo, process.env.GITHUB_TOKEN)
          )
        : null;

    return NextResponse.json(
      buildRecommendationPayload({ focus, targets, repository }),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to analyze repository",
      },
      { status: 502 }
    );
  }
}
