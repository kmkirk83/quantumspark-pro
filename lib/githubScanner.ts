export interface RepositoryFile {
  name: string;
  type: "file" | "dir" | "symlink" | "submodule";
}

export interface RepositoryInfo {
  open_issues_count: number;
  pushed_at: string;
  default_branch: string;
}

export interface ScanResult {
  hasCI: boolean;
  hasCopilotInstructions: boolean;
  hasTests: boolean;
  openIssues: number;
  lastCommit: string | null;
  defaultBranch: string;
}

/**
 * Scans a GitHub repository and returns a readiness summary.
 *
 * @param owner  - Repository owner (user or organisation)
 * @param repo   - Repository name
 * @param token  - Optional GitHub personal access token for authenticated requests
 */
export async function scanRepository(
  owner: string,
  repo: string,
  token?: string,
): Promise<ScanResult> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  const [contentsRes, repoRes] = await Promise.all([
    fetch(`${baseUrl}/contents`, { headers }),
    fetch(baseUrl, { headers }),
  ]);

  if (!contentsRes.ok) {
    throw new Error(
      `Failed to fetch repository contents for ${owner}/${repo}: ${contentsRes.status} ${contentsRes.statusText}`,
    );
  }

  if (!repoRes.ok) {
    throw new Error(
      `Failed to fetch repository info for ${owner}/${repo}: ${repoRes.status} ${repoRes.statusText}`,
    );
  }

  const contents = (await contentsRes.json()) as RepositoryFile[];
  const repoData = (await repoRes.json()) as RepositoryInfo;

  const topLevelNames = new Set(contents.map((f) => f.name));

  const hasCI = topLevelNames.has(".github");
  const hasTests =
    topLevelNames.has("tests") ||
    topLevelNames.has("__tests__") ||
    topLevelNames.has("test") ||
    topLevelNames.has("spec");

  let hasCopilotInstructions = false;

  if (hasCI) {
    const githubContentsRes = await fetch(
      `${baseUrl}/contents/.github`,
      { headers },
    );

    if (githubContentsRes.ok) {
      const githubContents = (await githubContentsRes.json()) as RepositoryFile[];
      hasCopilotInstructions = githubContents.some(
        (f) => f.name === "copilot-instructions.md",
      );
    }
  }

  return {
    hasCI,
    hasCopilotInstructions,
    hasTests,
    openIssues: repoData.open_issues_count,
    lastCommit: repoData.pushed_at ?? null,
    defaultBranch: repoData.default_branch,
  };
}
