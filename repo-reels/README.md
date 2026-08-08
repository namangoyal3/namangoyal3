# repo-reels

Automated pipeline that turns **trending GitHub repos into short vertical explainer videos** (720x1280 @ 30fps) in the style of viral dev-tool countdown reels: a talking-head AI avatar (HeyGen) inter-cut with animated motion-graphics slides, with word-synced karaoke captions.

The visual language was reverse-engineered frame-by-frame from a reference reel — see [`docs/VIDEO_ANATOMY.md`](docs/VIDEO_ANATOMY.md) for the full teardown (shot grammar, slide widget inventory, caption system, colors, cut rhythm).

## How a reel gets made

```
┌─────────────┐   ┌──────────────┐   ┌──────────────┐   ┌───────────────┐   ┌──────────────┐
│ 1. REPOS    │──▶│ 2. SCRIPT    │──▶│ 3. AVATAR    │──▶│ 4. TIMELINE   │──▶│ 5. RENDER    │
│ trending or │   │ Claude writes│   │ HeyGen reads │   │ word-level    │   │ Remotion     │
│ named repos │   │ hook→items→  │   │ the narration│   │ caption beats │   │ composites   │
│ via GitHub  │   │ CTA beats +  │   │ as your      │   │ + segment     │   │ avatar+slides│
│ API         │   │ slide plan   │   │ avatar (mp4) │   │ boundaries    │   │ → reel.mp4   │
└─────────────┘   └──────────────┘   └──────────────┘   └───────────────┘   └──────────────┘
```

Every stage degrades gracefully: no `ANTHROPIC_API_KEY` → built-in script template; no `HEYGEN_API_KEY` → stylized placeholder presenter; no whisper → estimated word timing. So you can run the whole thing end-to-end with **zero keys** first, then plug keys in one at a time.

## Quick start

```bash
cd repo-reels
npm install
cp .env.example .env   # fill in keys as you get them

# Zero-key smoke test (template script, placeholder presenter, bundled sample facts):
npm run pipeline -- --facts examples/sample-facts.json --mock --keyword CLAUDE

# Real thing — top 5 trending repos today:
npm run pipeline -- --trending 5 --keyword REPO

# Single-repo deep dive:
npm run pipeline -- --repo vercel/next.js --keyword NEXT
```

Output lands in `out/`: `script.json` (the editorial plan), `timeline.json` (frame-accurate render plan), `reel.mp4` (the video).

### Flags

| Flag | Meaning |
|---|---|
| `--trending N` | Use today's top N repos from github.com/trending (default mode, N=5) |
| `--repo owner/name[,owner/name…]` | Explicit repo list (1 repo = deep-dive format, 2+ = countdown) |
| `--language rust` | Filter trending by language |
| `--keyword WORD` | The comment-bait CTA keyword |
| `--facts file.json` | Offline mode: load repo facts from JSON instead of the GitHub API |
| `--mock` | Skip Claude + HeyGen (template script, placeholder presenter) |
| `--no-avatar` | Skip HeyGen even if keys are set |
| `--whisper` | Word-align captions to the real audio via whisper.cpp (see below) |
| `--no-render` | Stop after writing `timeline.json` |
| `--out dir` | Output directory (default `out/`) |

## Configuring HeyGen (your avatar)

1. Get your API key from HeyGen → Settings → API.
2. Find your avatar and voice ids:
   ```bash
   curl -H "X-Api-Key: $HEYGEN_API_KEY" https://api.heygen.com/v2/avatars | jq '.data.avatars[] | {avatar_id, avatar_name}' | head
   curl -H "X-Api-Key: $HEYGEN_API_KEY" https://api.heygen.com/v2/voices  | jq '.data.voices[] | {voice_id, name, language}' | head
   ```
3. Put `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID` in `.env`. If your id is an "instant avatar" / talking photo, also set `HEYGEN_AVATAR_TYPE=talking_photo`.

The pipeline sends the **full narration as one video** (720x1280, neutral background), polls until HeyGen finishes, and downloads it to `public/avatar.mp4`. The Remotion composition then runs it as the persistent bottom layer — slides overlay it, exactly like the reference edit — so the voice track is continuous.

## Caption timing accuracy

By default word timings are estimated (~2.6 words/sec, scaled to HeyGen's reported duration). That is good enough to look right. For frame-perfect karaoke, install the optional whisper.cpp helper and pass `--whisper`:

```bash
npm i @remotion/install-whisper-cpp
npm run pipeline -- --trending 5 --whisper
```

First run downloads whisper.cpp + the `base.en` model (~150 MB), then aligns captions to the actual HeyGen audio.

## Iterating on the look

```bash
npm run studio   # Remotion Studio: live-preview the composition with the sample timeline
```

- Colors/typography: `src/remotion/theme.ts`
- Slide widgets (kinetic titles, repo card, star chart, bars, installer, file tree, graph, terminal, CTA): `src/remotion/components/Slide.tsx`
- Captions: `src/remotion/components/Karaoke.tsx`
- Presenter layer + placeholder: `src/remotion/components/Presenter.tsx`
- Script structure/prompt: `src/pipeline/script.ts`

Chromium: Remotion downloads its own headless browser on first render. To use a system one instead, set `REMOTION_BROWSER=/path/to/chromium`. Note that recent full-Chromium builds removed the old headless mode Remotion launches with — if you see "Old Headless mode has been removed", point `REMOTION_BROWSER` at a `chrome-headless-shell` binary instead (Playwright installs ship one, e.g. `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`).

## Making it fully autonomous

The pipeline is a single command, so scheduling is trivial:

```bash
# cron: every day at 9:00 — fresh trending reel
0 9 * * * cd /path/to/repo-reels && npm run pipeline -- --trending 5 --whisper >> reels.log 2>&1
```

or a GitHub Action on `schedule:` that uploads `out/reel.mp4` as an artifact. Posting to socials (Instagram Graph API / YouTube Data API / TikTok) is an easy stage 6 to bolt onto `src/pipeline/index.ts`.

## Costs per reel (approx)

| Stage | Cost |
|---|---|
| GitHub API | free |
| Claude script (claude-opus-5, ~2k in / ~1.5k out) | ~$0.05 |
| HeyGen 60s avatar video | ~1 credit (plan-dependent) |
| Remotion render | free (local CPU, ~2-5 min) |

## Repo layout

```
repo-reels/
├── docs/VIDEO_ANATOMY.md      # frame-by-frame teardown of the reference reel
├── examples/sample-facts.json # offline demo repo facts
├── src/
│   ├── types.ts               # shared data model (ScriptDoc → Timeline)
│   ├── pipeline/
│   │   ├── index.ts           # CLI orchestrator (5 stages)
│   │   ├── github.ts          # repo metadata + trending scraper
│   │   ├── script.ts          # Claude script generation + template fallback
│   │   ├── heygen.ts          # HeyGen v2 generate/poll/download
│   │   └── timing.ts          # word beats, whisper alignment, timeline build
│   └── remotion/
│       ├── Root.tsx           # composition registration (720x1280@30)
│       ├── RepoReel.tsx       # presenter layer + slide sequences + captions
│       ├── theme.ts           # reference-reel visual identity
│       ├── sample.ts          # built-in demo timeline for Studio
│       └── components/        # Presenter, Karaoke, Slide widgets
└── out/                       # script.json, timeline.json, reel.mp4
```
