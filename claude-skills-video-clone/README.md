# Claude Skills Video Clone (placeholder avatar)

A programmatic, scene-by-scene recreation of the "5 Claude Code Skills" short
(720x1280, 30 fps, 44.4 s, 1332 frames). Every frame is drawn with Pillow —
no assets from the source video are copied. All talking-head shots are
replaced with a neutral **placeholder avatar** so a real presenter can be
dropped in later.

## What matches the source

- Resolution, frame rate, duration, and every scene cut (21 scenes,
  boundaries measured from the source).
- The full word-by-word caption track: 122 caption events recovered from the
  source frames via OCR, with per-frame in/out timing and the two caption
  styles (bold grotesque sans, italic serif accents).
- Scene graphics redrawn to layout: serif title card, pixel-crab mascot,
  animated 100,000-skills counter, file-fan diagram, terminal windows with
  typing, SKILL.md document, install-progress card, ASCII-wave "PROPERLY
  PLAN" card, Claude Code session window, GitHub README pages, animated Star
  History chart, premium-references grid, "vibe-coded" landing page with red
  slash, and the task-observer checklist card.

## Files

| File | Purpose |
| --- | --- |
| `render.py` | Renders all 1332 frames (single self-contained script) |
| `captions.json` | Caption track: frame ranges, text, style, color, position |
| `output/clone.mp4` | Assembled clone video |

## Rebuild

```bash
pip install pillow
python3 render.py --frames-dir /tmp/frames          # ~3 min on CPU
ffmpeg -framerate 30 -i /tmp/frames/r_%04d.png \
       -i source.mp4 -map 0:v -map 1:a -c:v libx264 -pix_fmt yuv420p \
       -c:a copy -shortest output/clone.mp4
```

The second input just carries the narration audio across from the source
file; drop `-i source.mp4 -map 1:a -c:a copy` for a silent build, or point
it at your own voiceover. Record your narration to the caption timings in
`captions.json` (frame N starts at `(N-1)/30` seconds).

## Replacing the placeholder avatar

`avatar_placeholder()` in `render.py` draws the silhouette panel used for
every talking-head region (fullscreen shots and the rounded lower-third
card). Swap its body for a `paste` of your own footage/still, or key your
presenter over the rendered frames in an editor — the placeholder occupies
the exact regions the presenter fills in the source.
