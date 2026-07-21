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
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
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
 */
export async function scanRepository(
  owner: string,
  repo: string,
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
  };
}
