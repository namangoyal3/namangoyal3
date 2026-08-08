import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { PixelMascot, Pill, useRise } from "./shared";

// ---------------------------------------------------------------------------
// 5. Installer card — progress bar with phases + numbered fan
// ---------------------------------------------------------------------------

export const Installer: React.FC<{ title: string; subtitle: string; count: number }> = ({ title, subtitle, count }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, Math.min(durationInFrames - 6, fps * 2.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pct = Math.round(progress * 100);
  const done = pct >= 100;
  const phase = done ? `✓ ${title} installed` : pct > 60 ? "Configuring…" : "Downloading…";

  return (
    <AbsoluteFill style={{ backgroundColor: theme.cream, alignItems: "center", justifyContent: "center", gap: 26 }}>
      {/* numbered fan */}
      <div style={{ display: "flex", gap: 34 }}>
        {Array.from({ length: Math.min(7, count) }).map((_, i) => {
          const s = spring({ frame: frame - i * 3, fps, config: { damping: 200 }, durationInFrames: 10 });
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: s }}>
              <span style={{ fontFamily: theme.serif, fontStyle: "italic", fontWeight: 700, fontSize: 40, color: theme.clay }}>{i + 1}</span>
              <span style={{ fontFamily: theme.serif, fontSize: 26, color: theme.ink, transform: `rotate(${(i - (count - 1) / 2) * 14}deg)` }}>↓</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: theme.ink, borderRadius: 8, padding: 8 }}>
            <span style={{ fontFamily: theme.mono, color: theme.cream, fontSize: 20 }}>{"</>"}</span>
          </div>
          <span style={{ fontFamily: theme.sans, fontWeight: 800, fontSize: 34, color: theme.ink }}>{title}</span>
        </div>
        <span style={{ fontFamily: theme.sans, fontSize: 14, letterSpacing: 4, color: "#8B8574" }}>{subtitle.toUpperCase()}</span>
      </div>

      <div style={{ width: 480 }}>
        <div style={{ height: 12, borderRadius: 6, background: "#CFC8B5", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: done ? theme.clay : theme.ink, borderRadius: 6 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontFamily: theme.mono, fontSize: 15, color: done ? theme.clay : "#6E6857" }}>{phase}</span>
          <span style={{ fontFamily: theme.mono, fontSize: 15, color: "#6E6857" }}>{pct}%</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
