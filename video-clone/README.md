# video-clone

A frame-accurate reconstruction of a 50.5s vertical short ("5 plugins to level up
your vibe-coding setup"), rebuilt from scratch as a [Remotion](https://remotion.dev)
composition. Every scene, caption and transition is redrawn in code; the presenter
footage is replaced with a neutral **placeholder avatar**.

    720 × 1280 · 30 fps · 1516 frames · 50.53s

## What "clone" means here

The source is a mix of motion graphics and real footage. Those two halves are
handled differently:

| Source element | In the clone |
| --- | --- |
| Shot cuts | Identical — the cut list is transcribed frame-for-frame (`src/data/timeline.ts`) |
| Burned-in captions | Identical — text and per-word timing read back off the source frames |
| Motion graphics (title cards, installer, illustrations) | Redrawn as SVG/CSS, matched to measured bounding boxes |
| Screen recordings (Supabase, Strix, SkillUI, Context7, Ramp) | Rebuilt as static-asset mockups — same layout and beats, not pixel copies |
| Camera motion | Matched by tracking: the source settles each element in ~20 frames, then locks. Nothing drifts |
| Presenter footage | **Placeholder avatar** — a featureless bust, not a character; same card geometry, head size and framing |
| Audio | The original track, muxed back in so the captions stay in sync |

Photographic b-roll cannot be reproduced pixel-for-pixel without the original
assets, so those shots are faithful recreations rather than copies. Everything
that is *drawn* — geometry, colour, type, timing — is matched numerically.

## Two things the first pass got wrong

Both were cases of inventing motion the source does not have, and both were
settled by measurement rather than by eye.

**The b-roll does not move.** Tracking each element frame by frame
(`tools/track_motion.py`) shows every shot snapping to a box within ~20 frames
of its cut and then holding perfectly still:

```
consoleErrors  f314..f361  x=66..645  y=218..579   unchanged for 48 frames
openBrowser    f170..f240  x=74..647  y=199..523   unchanged for 71 frames
rampBroll      f1008..1085 x=73..647  y=181..486   unchanged for 78 frames
```

Continuous zooms and rotations were replaced with a single `settle` easing
(`src/motion.ts`) that resolves to the measured box and is exactly 1 afterwards.

**The captions are hard cuts.** Sampling brightness in the caption band across a
cue boundary shows it switching in one frame and then holding constant:

```
f529: 4954   (previous cue)      f532: 5685
f530: 5683   (new cue)           f533: 5687
f531: 5684                       f534: 5684
```

So the per-caption fade and scale pop had to go — at ~120 cues it was the single
largest source of motion that isn't in the original.

`tools/verify_static.py` guards both, reporting per-frame motion inside every
shot against the source's own.

## Layout

```
src/
  Root.tsx                 compositions (VideoClone, VideoCloneSilent)
  Video.tsx                scene timeline + the five plugin title cards
  theme.ts                 palette and type stack sampled from the source
  data/timeline.ts         the cut list and the caption cue track
  motion.ts                the one easing used for framing — settle, then lock
  components/
    Caption.tsx            single caption layer for the whole film
    AvatarPlaceholder.tsx  the stand-in presenter (card + close-up variants)
    TitleCard.tsx          "THE FIRST / PLAYWRIGHT CLI" reveal
    Backdrops.tsx          spotlight, leaf-shadow wall, blurred desk
    Chrome.tsx             window / terminal / cursor primitives
    Icons.tsx              plugin marks, Claude crab, code-docs icon
  scenes/                  one file per plugin section
tools/
  compare.py               side-by-side source-vs-render contact sheets
  measure.py               numeric bounding-box diff per element
  track_motion.py          per-frame element boxes — proves the source holds still
  verify_static.py         per-frame motion in the clone vs the source, per shot
  verify_timing.py         scene-boundary and cut matching
  verify_captions.py       caption-change frame matching
```

Captions live in **one layer above every scene** rather than inside each scene.
That is what keeps word timing identical across shot cuts: the cue track is read
at absolute frames, and each scene only supplies placement and tone.

## Rendering

```bash
npm install
npm run build          # out/video-clone.mp4, audio muxed
npm start              # Remotion Studio
```

The committed render lives at [`render/video-clone.mp4`](render/video-clone.mp4).

Headless Chrome is passed explicitly because this environment ships its own:

```bash
npx remotion render VideoClone out/video-clone.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

## Verifying against the source

Put the source clip at `reference/source.mp4` (not committed), then:

```bash
python3 tools/measure.py                       # numeric bbox diff, per element
python3 tools/compare.py --frames 80,160,250   # visual contact sheet
```

`measure.py` prints the source box, the rendered box and the delta for each probe
— that is how the layout was dialled in, rather than by eyeballing screenshots.
Most elements land within a few pixels:

```
f200   browser panel     src=(74, 199, 574, 325)  clone=(74, 199, 574, 325)  Δ=(0, 0, 0, 0)
f440   code window       src=(72, 199, 576, 324)  clone=(72, 199, 576, 325)  Δ=(0, 0, 0, 1)
f250   display caption   src=(166, 827, 392, 57)  clone=(167, 827, 393, 58)  Δ=(1, 0, 1, 1)
```

Two timing checks run against the rendered file:

```bash
python3 tools/verify_timing.py   reference/source.mp4 out/video-clone.mp4
python3 tools/verify_captions.py reference/source.mp4 out/video-clone.mp4
```

Current state:

```
scene boundaries reproduced: 21/21
caption cues confirmed against source: 120/120   (within ±2 frames)
worst excess motion over the source's own: +0.00
matched 20/28 source luma cuts within ±2 frames
```

The eight unmatched luma cuts are all *inside* a scene, not shot changes: hard
zooms and content swaps in the source's screen recordings (f321/f346/f359 in the
console shot, f420/f432 in the editor, f850/f871 in the SkillUI terminal, f984 on
the CLAUDE.md card). The clone plays those beats more gently, so they fall under
the detector's threshold.

## Notes

- The display face in the source is a condensed didone. Playfair Display is the
  closest freely-licensed match, so `Caption.tsx` squeezes it horizontally
  (`displayStretch`) to land on the same cap-height-to-width ratio.
- The five title cards do **not** share one lockup — the source shifts the
  Playwright card about 60px higher than the rest — so their anchors are per-card.
- `public/audio.m4a` is the source's audio track, extracted with
  `ffmpeg -i source.mp4 -vn -c:a copy public/audio.m4a`.
