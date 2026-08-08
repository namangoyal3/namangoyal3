import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { PixelMascot, Pill, useRise } from "./shared";

// ---------------------------------------------------------------------------
// 9. CTA — "comment «KEYWORD»" lockup
// ---------------------------------------------------------------------------

export const Cta: React.FC<{ keyword: string }> = ({ keyword }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 12 });
  const s2 = spring({ frame: frame - 8, fps, config: { damping: 13, stiffness: 150 }, durationInFrames: 18 });
  return (
    <AbsoluteFill style={{ backgroundColor: theme.coal, alignItems: "center", justifyContent: "center", gap: 4 }}>
      <span style={{ fontFamily: theme.serif, fontStyle: "italic", fontSize: 54, color: theme.white, opacity: s1 }}>comment</span>
      <span
        style={{
          fontFamily: theme.sans,
          fontWeight: 900,
          fontSize: 86,
          color: theme.white,
          textShadow: `0 0 40px rgba(222,107,72,0.55)`,
          opacity: s2,
          transform: `scale(${0.85 + s2 * 0.15})`,
        }}
      >
        “{keyword}”
      </span>
      <span style={{ fontFamily: theme.sans, fontSize: 20, color: theme.dim, marginTop: 26, opacity: s2 }}>and I’ll send you the links</span>
    </AbsoluteFill>
  );
};
