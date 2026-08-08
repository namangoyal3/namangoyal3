import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { PixelMascot, Pill, useRise } from "./shared";

// ---------------------------------------------------------------------------
// 4. Comparison bars + big headline
// ---------------------------------------------------------------------------

const BAR_COLORS = ["#9E9EA8", "#F0A24A", "#4CC38A", "#8B7CF6"];

export const StatBars: React.FC<{ headline: string; groups: number }> = ({ headline, groups }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = spring({ frame, fps, config: { damping: 12, stiffness: 160 }, durationInFrames: 20 });
  return (
    <AbsoluteFill style={{ backgroundColor: theme.coal, alignItems: "center", justifyContent: "center", gap: 34 }}>
      <div
        style={{
          fontFamily: theme.sans,
          fontWeight: 800,
          fontSize: 84,
          color: "#E8E8EE",
          textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          transform: `scale(${0.7 + head * 0.3})`,
          opacity: head,
        }}
      >
        ↓ {headline} ↓
      </div>
      <div style={{ display: "flex", gap: 44, alignItems: "flex-end", height: 260 }}>
        {Array.from({ length: groups }).map((_, g) => (
          <div key={g} style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
            {BAR_COLORS.map((c, b) => {
              const target = 230 * (0.35 + random(`bar-${g}-${b}`) * 0.65) * (b === 0 ? 1 : 0.55 + random(`f-${g}-${b}`) * 0.3);
              const s = spring({ frame: frame - (g * 3 + b * 2), fps, config: { damping: 200 }, durationInFrames: 16 });
              return <div key={b} style={{ width: 26, height: Math.max(6, target * s), background: c, borderRadius: 5 }} />;
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
