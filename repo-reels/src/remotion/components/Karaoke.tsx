import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { TimelineSegment } from "../../types";
import { theme } from "../theme";

/**
 * Word-synced captions. Two styles from the reference reel:
 *  - sans: bold white karaoke word(s), bottom-center, scale-pop per beat
 *  - serif: huge italic ALL-CAPS display words, doubling as slide art
 */
export const Karaoke: React.FC<{ seg: TimelineSegment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = seg.start + frame / fps;

  const beats = seg.words ?? [];
  const idx = findBeat(beats, t);
  if (idx < 0) return null;
  const beat = beats[idx];
  const beatStartFrame = Math.round((beat.start - seg.start) * fps);
  const pop = spring({ frame: frame - beatStartFrame, fps, config: { damping: 200, stiffness: 400 }, durationInFrames: 6 });
  const scale = 1.08 - 0.08 * pop;

  const serif = seg.captionStyle === "serif";
  const split = Boolean(seg.avatarBelow);
  const onSlide = seg.shot === "slide";

  // Vertical placement follows the reference: sans sits low on the presenter,
  // serif sits in the middle of the slide art.
  const top = serif ? (split ? "40%" : "56%") : onSlide ? (split ? "44%" : "72%") : "70%";

  const text = serif ? beat.text.toUpperCase() : beat.text;

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
          transform: `scale(${scale})`,
        }}
      >
        {serif ? (
          <span
            style={{
              fontFamily: theme.serif,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 64,
              letterSpacing: 1,
              color: theme.white,
              textShadow: "0 3px 18px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.8)",
              textAlign: "center",
              padding: "0 30px",
            }}
          >
            {text}
          </span>
        ) : (
          <span
            style={{
              fontFamily: theme.sans,
              fontWeight: 800,
              fontSize: 44,
              color: theme.white,
              textShadow: "0 2px 10px rgba(0,0,0,0.65)",
              textAlign: "center",
              padding: "2px 18px",
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
