# Reference Video Anatomy

A frame-by-frame teardown of the reference reel ("Top 5 Claude Code Plugins", 47.7s,
720x1280 @ 30fps, portrait 9:16). This document is the design spec that the pipeline
in this repo reproduces programmatically.

## 1. High-level format

The video is a **countdown/listicle reel** built from exactly two shot types that
alternate on a fast rhythm (every 2–5 seconds):

| Shot type | Description |
|---|---|
| **A. Talking head** | AI avatar (HeyGen), waist-up, soft neutral background. Sometimes full-bleed, sometimes masked into a rounded-corner card sitting in the lower half while a slide occupies the top half. Two crop levels (medium + close-up) are alternated for emphasis, cut on sentence boundaries. |
| **B. Animated slide (b-roll)** | Full-screen motion-graphics card. Light warm-cream background (`#E9E3D5`-ish) for "explainer" slides, near-black (`#0D0D10`) for "showcase" slides. Content is built from a small set of reusable animated widgets (below). |

Audio: one continuous energetic voiceover (the avatar's TTS voice) + low-volume music bed.
Every spoken word is burned in as a **karaoke caption** — one word / short phrase at a
time, popping in sync with speech.

## 2. Narrative structure (reconstructed script)

Captions are verbatim word-by-word, so the narration could be fully reconstructed:

> **Hook (0.0–7.5s)** — "If you are new to Claude Code, here are the top five plugins
> you'll want in order to crush it."
>
> **Item 1 (7.5–15.5s)** — "The first is Ponytail. It optimizes your Claude Code output,
> cutting your usage by over 50% without losing any accuracy at all."
>
> **Item 2 (15.5–23.5s)** — "Second: Code Review — where five AI agents scan your code in
> parallel and catch bugs and errors before any of your app actually goes out."
>
> **Item 3 (23.5–31.5s)** — "Third: Claude-Mem. It gives Claude memory across every
> session, so it'll remember your project files without you ever having to re-explain a
> thing, ever."
>
> **Item 4 (31.5–39.5s)** — "Fourth: Obsidian Skills. It basically turns your Claude Code
> into a second brain, linking every file and function across your code base, so nothing
> will ever slip through the cracks."
>
> **Item 5 (39.5–44.5s)** — "The fifth is the official pack: Anthropic's official plugins.
> It's a great starting point — a curated set of the most useful skills that you can plug
> into Claude Code at any time."
>
> **CTA (44.5–47.7s)** — "So if you want to try all these, just comment 'Claude'."

Structural template: `HOOK → N items (each: rank title → showcase → proof/stat) → CTA`.
Each item follows a micro-arc: **name it → show it → quantify it**.

## 3. Slide widget inventory

Every b-roll slide in the video is one of these reusable widgets:

1. **Kinetic rank title** — huge italic serif all-caps words ("FIRST IS", "SECOND",
   "CODE REVIEW", "OBSIDIAN SKILLS") in a salmon/coral or black, words appearing
   one-by-one exactly as spoken, slight tracking-in + fade. Cream background.
2. **Repo showcase card** (dark bg) — styled GitHub README screenshot: logo, repo name,
   pill badges (`stars 73k`, `release v4.8.4`, `npm`, `works with 16 agents`,
   `license MIT`), medal badges ("#1 Repository Of The Day", "#1 Repository Of The
   Week"), one-line tagline ("He says nothing. He writes one line. It works."), and a
   metrics strip ("~54% less code (up to 94%) · ~20% cheaper · ~27% faster · 100% safe").
3. **Star-history chart** — line chart drawing itself left-to-right (star-history.com
   style) while the avatar keeps talking below.
4. **Comparison bar chart** (dark bg) — grouped bars, baseline vs plugin, with a giant
   "↓ 50% ↓" headline popping above.
5. **Installer card** — "Claude Code PLUGIN INSTALLER" card with an animated progress
   bar cycling through statuses ("Downloading… 67%", "Configuring agent
   instructions… 94%", "✓ Claude Code Plugin installed 100%" — bar turns orange on done).
6. **Numbered fan** — digits 1–5 with hand-drawn arrows fanning down toward the
   installer icon (used under the hook).
7. **Terminal window** — dark macOS-chrome terminal with typed Claude Code session
   lines; an orange pixel-art mascot sits on the window's top edge. Used for the hook and
   the code-review demo (agents scanning code, highlight line sweeping).
8. **File-tree sweep** — GitHub file listing with an orange rounded-rect highlight
   sweeping down rows (used for the official-plugins directory).
9. **Knowledge graph** — dark slide, network of dots + edges; nodes/links light up
   progressively (Obsidian graph view).
10. **Browser screencast frame** — real product screen recording inside an
    orange-bordered rounded frame over a blurred backdrop (checkout demo, error consoles
    with red highlighted text).
11. **CTA close** — avatar close-up, captions switch to a stacked two-style lockup:
    italic serif "comment" + bold sans `"Claude"`.

## 4. Caption system

Two caption styles, both word-synced:

- **Sans karaoke** (on talking-head + light slides): bold geometric sans, white with
  subtle shadow, ~48–56px, bottom-center on the avatar or under the slide widget.
  1–3 words per beat; each beat replaces the previous (no accumulation); slight
  scale-pop (1.06 → 1.0) on entry.
- **Serif display** (on dark showcase slides): very large italic serif all-caps with a
  soft drop shadow ("THE", "ERRORS", "BEFORE", "ACTUALLY", "OUT"), centered; acts as
  both caption and art.

Rhythm: ~2.5–3 words/sec. Caption style is a property of the underlying shot.

## 5. Visual identity

- Cream: `#E9E3D5` (light slide bg) · Ink: `#141414` · Coal: `#0D0D10` (dark slide bg)
- Accent (clay/coral): `#DE6B48` — pixel mascot, progress bar, highlights, borders
- Salmon (kinetic titles): `#E8927C`
- Serif display: high-contrast italic serif (Playfair-Display-like)
- UI sans: Inter/Helvetica-like; terminal: monospace
- Rounded corners everywhere (16–24px), soft long shadows, paper-grain feel on cream
- Signature detail: orange pixel-art mascot (8-bit crab/robot) perched on windows

## 6. Cut rhythm (measured)

- 0–2s hook over terminal+logo slide, avatar below
- one cut every ~2–4s; never more than ~5s on the same composition
- each item: rank title (~1s) → showcase (~3–4s) → proof stat (~2–3s)
- avatar interjects between slides every 2nd or 3rd cut, alternating crop level
- CTA: single close-up hold ~3s

## 7. How this maps to an automated pipeline

| Video element | Automated by |
|---|---|
| Narration script | LLM (Claude) from repo metadata, forced into the hook→items→CTA template with per-segment visual hints |
| Avatar + voice | HeyGen API (avatar video from script text, 720x1280) |
| Word-level caption timing | Whisper word timestamps on the HeyGen audio (or duration-proportional estimation as fallback) |
| Slides | Remotion (React) components — the widget inventory above, parameterized by repo facts (name, stars, badges, taglines, stats) |
| Star chart | GitHub API stargazer data (or synthesized curve to current count) |
| Composition + render | Remotion timeline: alternate avatar/slide segments, karaoke captions bound to word timings, final MP4 encode |

See `../README.md` for the concrete pipeline stages and commands.
