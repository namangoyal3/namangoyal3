import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { PixelMascot, Pill, useRise } from "./shared";

// ---------------------------------------------------------------------------
// 1. Kinetic rank title — cream bg, giant italic serif, staggered words
// ---------------------------------------------------------------------------

export const Kinetic: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(/\s+/);
  return (
    <AbsoluteFill style={{ backgroundColor: theme.cream, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {words.map((w, i) => {
          const s = spring({ frame: frame - i * 5, fps, config: { damping: 16, stiffness: 140 }, durationInFrames: 18 });
          return (
            <span
              key={i}
              style={{
                fontFamily: theme.serif,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: Math.min(108, 620 / Math.max(4, w.length)) + 26,
                letterSpacing: 2,
                color: theme.salmon,
                textShadow: "0 3px 0 rgba(0,0,0,0.08)",
                opacity: s,
                transform: `translateY(${(1 - s) * 40}px) scale(${0.92 + s * 0.08})`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
