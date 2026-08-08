import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { PixelMascot, Pill, useRise } from "./shared";

// ---------------------------------------------------------------------------
// 6. File tree with sweeping highlight
// ---------------------------------------------------------------------------

export const FileTree: React.FC<{ rows: string[] }> = ({ rows }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const list = rows.length ? rows : ["core", "cli", "docs", "examples"];
  const active = Math.min(list.length - 1, Math.floor(interpolate(frame, [6, Math.max(12, durationInFrames - 8)], [0, list.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  return (
    <AbsoluteFill style={{ backgroundColor: theme.coal, alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 560 }}>
        {list.map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              borderRadius: 10,
              border: i === active ? `3px solid ${theme.clay}` : "3px solid transparent",
              background: i === active ? "rgba(222,107,72,0.09)" : "transparent",
            }}
          >
            <span style={{ fontFamily: theme.mono, fontSize: 20, color: "#D8D8DE" }}>
              <span style={{ color: "#79C0FF" }}>▸ </span>
              {r}
            </span>
            <span style={{ fontFamily: theme.sans, fontSize: 13, color: "#63636E" }}>updated recently</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
