import { NextRequest, NextResponse } from "next/server";

import { scanRepository } from "@/lib/githubScanner";
import {
  buildRecommendationPayload,
  buildRepositorySnapshot,
  parseFocus,
  parseTargets,
} from "@/lib/recommendationService";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const owner = searchParams.get("owner")?.trim();
  const repo = searchParams.get("repo")?.trim();
  const focus = parseFocus(searchParams.get("focus"));
  const targets = parseTargets(searchParams.get("targets"));

  if ((owner && !repo) || (!owner && repo)) {
    return NextResponse.json(
      {
        error: "owner and repo must be provided together",
      },
      { status: 400 }
    );
  }

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
