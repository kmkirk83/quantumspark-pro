<<<<<<< HEAD
const GITHUB_API_BASE = "https://api.github.com";

export interface RepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  open_issues_count: number;
  has_issues: boolean;
  default_branch: string;
  updated_at: string;
}

export interface WorkflowRun {
  id: number;
  name: string | null;
  status: string | null;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface ScanResult {
  repo: RepoInfo;
  latestRun: WorkflowRun | null;
  ciPassing: boolean;
  openIssues: number;
}

/**
 * Fetches repository metadata from the GitHub API.
 */
export async function fetchRepoInfo(
  owner: string,
  repo: string,
  token?: string
): Promise<RepoInfo> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(url, { headers, next: { revalidate: 60 } });

  if (!response.ok) {
    throw new Error(
      `GitHub API error ${response.status}: ${response.statusText}`
    );
  }

  return response.json() as Promise<RepoInfo>;
}

/**
 * Fetches the most recent workflow run for a repository.
 */
export async function fetchLatestWorkflowRun(
  owner: string,
  repo: string,
  token?: string
): Promise<WorkflowRun | null> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs?per_page=1`;
  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(url, { headers, next: { revalidate: 60 } });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { workflow_runs: WorkflowRun[] };
  return data.workflow_runs[0] ?? null;
}

/**
 * Performs a full scan of a repository, returning repo info, CI status, and
 * open issue count.
=======
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
>>>>>>> origin/main
 */
export async function scanRepository(
  owner: string,
  repo: string,
<<<<<<< HEAD
  token?: string
): Promise<ScanResult> {
  const [repoInfo, latestRun] = await Promise.all([
    fetchRepoInfo(owner, repo, token),
    fetchLatestWorkflowRun(owner, repo, token),
  ]);

  return {
    repo: repoInfo,
    latestRun,
    ciPassing: latestRun?.conclusion === "success",
    openIssues: repoInfo.open_issues_count,
=======
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
>>>>>>> origin/main
  };
}
