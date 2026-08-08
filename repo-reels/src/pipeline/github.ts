import type { RepoFacts } from "../types";

const API = "https://api.github.com";

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "repo-reels",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

export async function fetchRepo(fullName: string): Promise<RepoFacts> {
  const res = await fetch(`${API}/repos/${fullName}`, { headers: ghHeaders() });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${fullName}: ${await res.text()}`);
  const r = (await res.json()) as any;

  let version: string | null = null;
  try {
    const rel = await fetch(`${API}/repos/${fullName}/releases/latest`, { headers: ghHeaders() });
    if (rel.ok) version = ((await rel.json()) as any).tag_name ?? null;
  } catch {
    // releases are optional
  }

  return {
    fullName: r.full_name,
    name: r.name,
    url: r.html_url,
    description: r.description ?? "",
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    language: r.language ?? null,
    license: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null,
    version,
    topics: r.topics ?? [],
    // Filled in by script generation:
    tagline: "",
    metrics: [],
  };
}

/**
 * GitHub has no official trending API — scrape github.com/trending.
 * Returns "owner/name" strings, most-trending first.
 */
export async function fetchTrending(opts: { since?: "daily" | "weekly"; language?: string; limit?: number } = {}): Promise<string[]> {
  const { since = "daily", language = "", limit = 5 } = opts;
  const url = `https://github.com/trending/${encodeURIComponent(language)}?since=${since}`;
  const res = await fetch(url, { headers: { "User-Agent": "repo-reels" } });
  if (!res.ok) throw new Error(`github.com/trending returned ${res.status}`);
  const html = await res.text();

  // Repo links appear as <h2 ...><a href="/owner/name" ...> inside <article> blocks.
  const names: string[] = [];
  const articleRe = /<article[\s\S]*?<h2[\s\S]*?href="\/([^"\/]+\/[^"\/]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = articleRe.exec(html)) && names.length < limit) {
    const full = m[1];
    if (!names.includes(full)) names.push(full);
  }
  if (names.length === 0) throw new Error("Could not parse any repos from github.com/trending (markup may have changed)");
  return names;
}

export function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}
