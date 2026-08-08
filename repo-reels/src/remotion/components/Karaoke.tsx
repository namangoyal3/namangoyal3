import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TimelineSegment } from "../../types";
import { theme } from "../theme";

/**
 * Word-synced captions. Two styles from the reference reel:
 *  - sans: bold white karaoke word(s), lower-third center, spring-pop per beat
 *  - serif: huge italic ALL-CAPS display words, doubling as slide art,
 *    fading in with a slow floating scale drift
 */

const MAX_TEXT_WIDTH = 640; // px budget the caption must fit inside

/**
 * Deterministic font-size fit from text length. `avgGlyph` is the average
 * glyph advance as a fraction of the font size (measured heuristics for
 * Inter 800 / Playfair Display 800 italic caps). Prefers a single line;
 * falls back to a 2-line wrap for very long beats, shrinking so the longer
 * line still fits within MAX_TEXT_WIDTH.
 */
function fitFontSize(text: string, base: number, min: number, avgGlyph: number): number {
  const len = Math.max(1, text.length);
  const oneLine = MAX_TEXT_WIDTH / (avgGlyph * len);
  if (oneLine >= base) return base;
  // Keep one line while the shrink stays tasteful (>= 72% of base).
  if (oneLine >= base * 0.72) return Math.floor(oneLine);
  // Two lines max: size against the longer wrapped line (+1 for the break slack).
  const perLine = Math.ceil(len / 2) + 1;
  const twoLine = MAX_TEXT_WIDTH / (avgGlyph * perLine);
  return Math.max(min, Math.floor(Math.min(base, twoLine)));
}

export const Karaoke: React.FC<{ seg: TimelineSegment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = seg.start + frame / fps;

  const beats = seg.words ?? [];
  const idx = findBeat(beats, t);
  if (idx < 0) return null;
  const beat = beats[idx];
  const beatStartFrame = Math.round((beat.start - seg.start) * fps);
  const local = frame - beatStartFrame;

  const serif = seg.captionStyle === "serif";
  const split = Boolean(seg.avatarBelow);
  const onSlide = seg.shot === "slide";

  // Vertical placement follows the reference: sans sits low on the presenter,
  // higher on split slides; serif floats mid-slide.
  const top = serif
    ? split
      ? "39%"
      : "55%"
    : onSlide
      ? split
        ? "44%"
        : "76%"
      : "69%";

  const text = serif ? beat.text.toUpperCase() : beat.text;

  let transform: string;
  let opacity = 1;

  if (serif) {
    // Quick fade + rise entrance, then a subtle continuing upward scale
    // drift over the beat for the reference's floating feel.
    opacity = interpolate(local, [0, 4], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const rise = interpolate(local, [0, 6], [14, 0], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const beatFrames = Math.max(1, Math.round((beat.end - beat.start) * fps));
    const progress = Math.min(1, Math.max(0, local / beatFrames));
    const drift = 1 + 0.03 * progress;
    transform = `translateY(${rise}px) scale(${drift})`;
  } else {
    // Spring pop: 1.12 -> 1 in ~5 frames with a slight upward drift.
    const pop = spring({
      frame: local,
      fps,
      config: { damping: 200, stiffness: 400 },
      durationInFrames: 5,
    });
    const scale = 1.12 - 0.12 * pop;
    const drift = 6 * (1 - pop);
    transform = `translateY(${drift}px) scale(${scale})`;
  }

  const fontSize = serif
    ? fitFontSize(text, 66, 38, 0.64)
    : fitFontSize(text, 46, 30, 0.56);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transform,
          opacity,
        }}
      >
        {serif ? (
          <span
            style={{
              fontFamily: theme.serif,
              fontStyle: "italic",
              fontWeight: 800,
              fontSize,
              letterSpacing: 1,
              lineHeight: 1.05,
              color: theme.white,
              textShadow: "0 3px 2px rgba(0,0,0,0.8), 0 10px 40px rgba(0,0,0,0.5)",
              textAlign: "center",
              maxWidth: MAX_TEXT_WIDTH,
              padding: "0 10px",
            }}
          >
            {text}
          </span>
        ) : (
          <span
            style={{
              fontFamily: theme.sans,
              fontWeight: 800,
              fontSize,
              letterSpacing: -0.5,
              lineHeight: 1.05,
              color: theme.white,
              textShadow: "0 2px 6px rgba(0,0,0,0.55), 0 8px 28px rgba(0,0,0,0.35)",
              textAlign: "center",
              maxWidth: MAX_TEXT_WIDTH,
              padding: "2px 10px",
            }}
          >
            {text}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};

function findBeat(beats: { start: number; end: number }[], t: number): number {
  let idx = -1;
  for (let i = 0; i < beats.length; i++) {
    if (t >= beats[i].start) idx = i;
  }
  return idx;
}
