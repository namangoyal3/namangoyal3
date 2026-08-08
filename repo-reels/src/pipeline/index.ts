#!/usr/bin/env tsx
/**
 * repo-reels pipeline
 *
 *   npm run pipeline -- --trending 5            # top-5 countdown of today's trending repos
 *   npm run pipeline -- --repo vercel/next.js   # single-repo deep dive
 *   npm run pipeline -- --trending 5 --mock     # no API keys needed (template script + placeholder avatar)
 *
 * Stages: fetch repos -> script (Claude or template) -> avatar (HeyGen) ->
 *         word timing (whisper or estimate) -> timeline.json -> Remotion render.
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile, access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fetchRepo, fetchTrending } from "./github";
import { generateScriptFromTemplate, generateScriptWithClaude } from "./script";
import { heygenConfigFromEnv, renderAvatarVideo } from "./heygen";
import { buildTimeline, whisperAligner } from "./timing";
import type { ScriptDoc } from "../types";

interface Args {
  repos: string[];
  trending: number | null;
  language: string;
  keyword: string;
  facts: string | null;
  mock: boolean;
  avatar: boolean;
  whisper: boolean;
  render: boolean;
  out: string;
}

function parseArgs(argv: string[]): Args {
  const a: Args = {
    repos: [],
    trending: null,
    language: "",
    keyword: "REPO",
    facts: null,
    mock: false,
    avatar: true,
    whisper: false,
    render: true,
    out: "out",
  };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--repo") a.repos.push(...argv[++i].split(","));
    else if (v === "--trending") a.trending = Number(argv[i + 1]?.match(/^\d+$/) ? argv[++i] : 5);
    else if (v === "--language") a.language = argv[++i];
    else if (v === "--keyword") a.keyword = argv[++i];
    else if (v === "--facts") a.facts = argv[++i];
    else if (v === "--mock") a.mock = true;
    else if (v === "--no-avatar") a.avatar = false;
    else if (v === "--whisper") a.whisper = true;
    else if (v === "--no-render") a.render = false;
    else if (v === "--out") a.out = argv[++i];
    else if (v === "--help" || v === "-h") {
      console.log(
        `Usage: npm run pipeline -- [--repo owner/name[,owner/name...]] [--trending N] [--language js]\n` +
          `                           [--keyword WORD] [--mock] [--no-avatar] [--whisper] [--no-render] [--out dir]`,
      );
      process.exit(0);
    }
  }
  return a;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(args.out);
  await mkdir(outDir, { recursive: true });
  await mkdir("public", { recursive: true });

  // ---- 1. Repos -----------------------------------------------------------
  let repos = [];
  if (args.facts) {
    console.log(`[1/5] Loading repo facts from ${args.facts} (offline mode)…`);
    repos = JSON.parse(await readFile(args.facts, "utf8"));
  } else {
    let names = args.repos;
    if (names.length === 0) {
      const n = args.trending ?? 5;
      console.log(`[1/5] Fetching top ${n} trending repos${args.language ? ` (${args.language})` : ""}…`);
      names = await fetchTrending({ limit: n, language: args.language });
    } else {
      console.log(`[1/5] Fetching ${names.length} repo(s)…`);
    }
    for (const n of names) {
      console.log(`  - ${n}`);
      repos.push(await fetchRepo(n));
    }
  }

  // ---- 2. Script ----------------------------------------------------------
  let script: ScriptDoc;
  if (!args.mock && process.env.ANTHROPIC_API_KEY) {
    console.log(`[2/5] Writing script with Claude…`);
    script = await generateScriptWithClaude(repos, args.keyword);
  } else {
    console.log(`[2/5] Writing script from template${args.mock ? " (mock mode)" : " (no ANTHROPIC_API_KEY)"}…`);
    script = generateScriptFromTemplate(repos, args.keyword);
  }
  const narration = script.segments.map((s) => s.narration).join(" ");
  await writeFile(path.join(outDir, "script.json"), JSON.stringify(script, null, 2));
  console.log(`  ${script.segments.length} beats, ${narration.split(/\s+/).length} words -> ${args.out}/script.json`);

  // ---- 3. Avatar ----------------------------------------------------------
  let avatarSrc: string | undefined;
  let heygenDuration: number | undefined;
  const heygen = heygenConfigFromEnv();
  if (!args.mock && args.avatar && heygen) {
    console.log(`[3/5] Rendering HeyGen avatar…`);
    const file = "public/avatar.mp4";
    const { durationSec } = await renderAvatarVideo(heygen, narration, file);
    avatarSrc = "avatar.mp4";
    heygenDuration = durationSec;
  } else {
    const why = args.mock ? "mock mode" : !args.avatar ? "--no-avatar" : "HEYGEN_API_KEY/AVATAR_ID/VOICE_ID not set";
    console.log(`[3/5] Skipping HeyGen avatar (${why}) — using placeholder presenter`);
    // Reuse a previously downloaded avatar if one exists
    try {
      await access("public/avatar.mp4");
      avatarSrc = "avatar.mp4";
      console.log(`  found existing public/avatar.mp4 — will use it`);
    } catch {
      /* no avatar available */
    }
  }

  // ---- 4. Timeline --------------------------------------------------------
  console.log(`[4/5] Building timeline…`);
  let aligned = null;
  if (args.whisper && avatarSrc) {
    aligned = await whisperAligner(`public/${avatarSrc}`).align(narration);
  }
  const timeline = buildTimeline(script, { avatarSrc, aligned, totalDurationSec: heygenDuration });
  await writeFile(path.join(outDir, "timeline.json"), JSON.stringify(timeline, null, 2));
  console.log(`  ${timeline.durationInFrames} frames @ ${timeline.fps}fps (${(timeline.durationInFrames / timeline.fps).toFixed(1)}s) -> ${args.out}/timeline.json`);

  // ---- 5. Render ----------------------------------------------------------
  if (!args.render) {
    console.log(`[5/5] Skipping render (--no-render). Render later with:\n  npx remotion render src/remotion/index.ts RepoReel ${args.out}/reel.mp4 --props=${args.out}/timeline.json`);
    return;
  }
  console.log(`[5/5] Rendering with Remotion…`);
  const outFile = path.join(outDir, "reel.mp4");
  await run("npx", ["remotion", "render", "src/remotion/index.ts", "RepoReel", outFile, `--props=${path.join(outDir, "timeline.json")}`]);
  console.log(`\nDone -> ${outFile}`);
}

function run(cmd: string, argv: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, argv, { stdio: "inherit", env: process.env });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))));
    child.on("error", reject);
  });
}

main().catch((err) => {
  console.error(`\nPipeline failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
