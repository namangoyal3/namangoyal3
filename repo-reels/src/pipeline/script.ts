import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";
import type { RepoFacts, ScriptDoc, Segment, SlideKind, SlideSpec } from "../types";
import { formatStars } from "./github";

const RANK_WORDS = ["FIRST IS", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH"];

// ---------------------------------------------------------------------------
// Claude generates the editorial layer: narration beats, taglines, metrics.
// Slide props are assembled deterministically from repo facts afterwards, so
// the model never has to emit pixel-level details.
// ---------------------------------------------------------------------------

const GenSegment = z.object({
  narration: z.string().describe("Verbatim words spoken during this beat, 4-20 words"),
  shot: z.enum(["avatar", "slide"]),
  slideKind: z
    .enum(["kinetic", "repoCard", "starHistory", "statBars", "installer", "fileTree", "graph", "terminal", "cta"])
    .nullable()
    .describe("Required when shot=slide, null for avatar shots"),
  kineticText: z.string().nullable().describe("ALL-CAPS display text for kinetic slides, e.g. 'SECOND' or 'CODE REVIEW'"),
  headline: z.string().nullable().describe("Big stat headline for statBars slides, e.g. '50%'"),
  repoIndex: z.number().int().describe("Index into the repos array this beat refers to; -1 for hook/outro"),
});

const GenScript = z.object({
  title: z.string(),
  repoEditorial: z.array(
    z.object({
      repoIndex: z.number().int(),
      tagline: z.string().describe("Punchy one-liner for the repo card, under 10 words"),
      metrics: z.array(z.string()).describe("2-4 short proof points, e.g. '~54% less code' or '73k stars'"),
    }),
  ),
  segments: z.array(GenSegment),
});

const SYSTEM = `You write scripts for 45-60 second vertical video reels that explain GitHub repositories, in the exact format of viral dev-tool countdown videos.

Structure (follow strictly):
1. HOOK (2 beats): "If you're into X, here are the top N repos..." — first beat over a terminal slide, second over an installer slide.
2. For EACH repo, exactly this micro-arc:
   a. kinetic slide beat introducing the rank + name (narration like "The first is Ponytail", kineticText like "FIRST IS")
   b. repoCard slide beat: what it does in one punchy line
   c. 1-2 avatar beats: the concrete benefit, with a number if possible
   d. one proof slide beat: starHistory (growth), statBars (a % improvement, set headline), graph (connects/links things), fileTree (curated collection), or terminal (agents/CLI action) — pick what matches the repo
3. CTA (1 beat, slideKind cta): tell viewers to comment a keyword to get the links.

Narration rules: spoken, energetic, second person, present tense. Short sentences. Concrete numbers over adjectives. Total narration 110-150 words. Every claim must come from the provided repo facts — do not invent stats; when no number exists, use star counts or qualitative benefit.
For avatar beats set slideKind/kineticText/headline to null. Vary avatar/slide so no more than 2 consecutive beats share a shot.`;

export async function generateScriptWithClaude(repos: RepoFacts[], keyword: string): Promise<ScriptDoc> {
  const client = new Anthropic();

  const facts = repos.map((r, i) => ({
    index: i,
    fullName: r.fullName,
    description: r.description,
    stars: r.stars,
    forks: r.forks,
    language: r.language,
    license: r.license,
    version: r.version,
    topics: r.topics,
  }));

  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Write the reel script for ${repos.length === 1 ? "a deep-dive on this repo" : `a top-${repos.length} countdown of these repos`}. CTA keyword: "${keyword}".\n\nRepo facts:\n${JSON.stringify(facts, null, 2)}`,
      },
    ],
    output_config: { format: zodOutputFormat(GenScript) },
  });

  const gen = response.parsed_output;
  if (!gen) throw new Error("Claude returned no parseable script");

  for (const e of gen.repoEditorial) {
    const r = repos[e.repoIndex];
    if (r) {
      r.tagline = e.tagline;
      r.metrics = e.metrics;
    }
  }

  const segments: Segment[] = gen.segments.map((s: z.infer<typeof GenSegment>, i: number) => {
    const repo = s.repoIndex >= 0 ? repos[s.repoIndex] : undefined;
    if (s.shot === "avatar" || !s.slideKind) {
      return {
        id: `seg-${i}`,
        narration: s.narration,
        shot: "avatar",
        captionStyle: "sans",
        avatarCrop: i % 2 === 0 ? "medium" : "close",
      };
    }
    return {
      id: `seg-${i}`,
      narration: s.narration,
      shot: "slide",
      slide: buildSlide(s.slideKind as SlideKind, repo, {
        kineticText: s.kineticText ?? undefined,
        headline: s.headline ?? undefined,
        keyword,
        repoCount: repos.length,
      }),
      captionStyle: slideCaptionStyle(s.slideKind as SlideKind),
      avatarBelow: ["repoCard", "starHistory", "statBars", "graph"].includes(s.slideKind),
    };
  });

  return { title: gen.title, repos, segments };
}

// ---------------------------------------------------------------------------
// Deterministic slide-prop assembly (shared by Claude + template paths)
// ---------------------------------------------------------------------------

function slideCaptionStyle(kind: SlideKind): "sans" | "serif" {
  return ["repoCard", "starHistory", "statBars", "graph", "cta"].includes(kind) ? "serif" : "sans";
}

function buildSlide(
  kind: SlideKind,
  repo: RepoFacts | undefined,
  extra: { kineticText?: string; headline?: string; keyword: string; repoCount: number },
): SlideSpec {
  switch (kind) {
    case "kinetic":
      return { kind, props: { text: extra.kineticText ?? repo?.name?.toUpperCase() ?? "NEXT" } };
    case "repoCard":
      return {
        kind,
        props: {
          name: repo?.name ?? "repo",
          fullName: repo?.fullName ?? "",
          tagline: repo?.tagline || repo?.description || "",
          stars: formatStars(repo?.stars ?? 0),
          version: repo?.version ?? undefined,
          language: repo?.language ?? undefined,
          license: repo?.license ?? undefined,
          metrics: repo?.metrics ?? [],
        },
      };
    case "starHistory":
      return { kind, props: { fullName: repo?.fullName ?? "", stars: repo?.stars ?? 1000 } };
    case "statBars":
      return { kind, props: { headline: extra.headline ?? "50%", groups: 4 } };
    case "installer":
      return { kind, props: { title: repo?.name ?? "Repo", subtitle: "TRENDING INSTALLER", count: extra.repoCount } };
    case "fileTree":
      return { kind, props: { rows: (repo?.topics?.length ? repo.topics : ["core", "cli", "docs", "examples", "agents", "plugins"]).slice(0, 9) } };
    case "graph":
      return { kind, props: { label: repo?.name ?? "" } };
    case "terminal":
      return { kind, props: { title: repo?.name ?? "trending", lines: terminalLines(repo) } };
    case "cta":
      return { kind, props: { keyword: extra.keyword } };
  }
}

function terminalLines(repo?: RepoFacts): string[] {
  const n = repo?.name ?? "repo";
  return [
    `$ git clone ${repo?.url ?? "https://github.com/…"}`,
    `Cloning into '${n}'...`,
    `$ cd ${n} && ./install`,
    `✓ ${formatStars(repo?.stars ?? 0)} developers already on board`,
  ];
}

// ---------------------------------------------------------------------------
// Template fallback — no API key needed. Mirrors the reference structure.
// ---------------------------------------------------------------------------

export function generateScriptFromTemplate(repos: RepoFacts[], keyword: string): ScriptDoc {
  for (const r of repos) {
    if (!r.tagline) r.tagline = r.description.length > 60 ? r.description.slice(0, 57) + "…" : r.description || `${r.name}, but faster.`;
    if (!r.metrics.length) {
      r.metrics = [`${formatStars(r.stars)} stars`, `${formatStars(r.forks)} forks`];
      if (r.language) r.metrics.push(r.language);
      if (r.license) r.metrics.push(`${r.license} licensed`);
    }
  }

  const many = repos.length > 1;
  const segments: Segment[] = [];
  let i = 0;
  const push = (s: Omit<Segment, "id">) => segments.push({ id: `seg-${i++}`, ...s });

  push({
    narration: many
      ? `If you live on GitHub, here are the top ${repos.length} trending repos`
      : `If you live on GitHub, here is the repo everyone is talking about`,
    shot: "slide",
    slide: buildSlide("terminal", repos[0], { keyword, repoCount: repos.length }),
    captionStyle: "sans",
  });
  push({
    narration: `you'll want to check out this week.`,
    shot: "slide",
    slide: buildSlide("installer", repos[0], { keyword, repoCount: repos.length }),
    captionStyle: "sans",
  });

  const proofRotation: SlideKind[] = ["starHistory", "statBars", "graph", "fileTree", "terminal"];
  repos.forEach((repo, idx) => {
    push({
      narration: many ? `${idx === 0 ? "The first is" : RANK_WORDS[idx].toLowerCase().replace(" is", "") + " is"} ${repo.name}.` : `Meet ${repo.name}.`,
      shot: "slide",
      slide: buildSlide("kinetic", repo, { kineticText: many ? RANK_WORDS[idx] : repo.name.toUpperCase(), keyword, repoCount: repos.length }),
      captionStyle: "sans",
    });
    push({
      narration: repo.tagline || repo.description || `${repo.name} is blowing up right now.`,
      shot: "slide",
      slide: buildSlide("repoCard", repo, { keyword, repoCount: repos.length }),
      captionStyle: "serif",
      avatarBelow: true,
    });
    push({
      narration: `It already has ${formatStars(repo.stars)} stars${repo.language ? ` and it's written in ${repo.language}` : ""}.`,
      shot: "avatar",
      captionStyle: "sans",
      avatarCrop: idx % 2 === 0 ? "medium" : "close",
    });
    push({
      narration: `and developers are adopting it fast.`,
      shot: "slide",
      slide: buildSlide(proofRotation[idx % proofRotation.length], repo, { headline: formatStars(repo.stars), keyword, repoCount: repos.length }),
      captionStyle: "serif",
      avatarBelow: true,
    });
  });

  push({
    narration: `If you want the links to all of these, just comment "${keyword}".`,
    shot: "slide",
    slide: buildSlide("cta", repos[0], { keyword, repoCount: repos.length }),
    captionStyle: "serif",
  });

  const title = many ? `Top ${repos.length} Trending GitHub Repos` : `${repos[0].name} explained`;
  return { title, repos, segments };
}
