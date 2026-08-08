import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { PixelMascot, Pill, useRise } from "./shared";

// ---------------------------------------------------------------------------
// 8. Terminal window with typed lines + pixel mascot
// ---------------------------------------------------------------------------

export const Terminal: React.FC<{ title: string; lines: string[] }> = ({ title, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charsShown = Math.floor(interpolate(frame, [4, fps * 2.6], [0, lines.join("").length + lines.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  let budget = charsShown;
  return (
    <AbsoluteFill style={{ backgroundColor: theme.cream, alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 580 }}>
        <div style={{ position: "absolute", top: -46, left: "50%", transform: "translateX(-50%)" }}>
          <PixelMascot size={70} />
        </div>
        <div style={{ background: "#121216", borderRadius: 14, boxShadow: "0 18px 60px rgba(0,0,0,0.28)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", background: "#1D1D24" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
            ))}
            <span style={{ fontFamily: theme.mono, fontSize: 13, color: "#8A8A96", marginLeft: 8 }}>{title}</span>
          </div>
          <div style={{ padding: "18px 20px 22px", minHeight: 170 }}>
            {lines.map((l, i) => {
              const take = Math.max(0, Math.min(l.length, budget));
              budget -= l.length + 1;
              const shown = l.slice(0, take);
              if (!shown && take <= 0) return null;
              return (
                <div key={i} style={{ fontFamily: theme.mono, fontSize: 17, lineHeight: 1.7, color: l.startsWith("✓") ? "#7EE787" : l.startsWith("$") ? "#E8E8EE" : "#9A9AA6" }}>
                  {shown}
                  {take < l.length ? <span style={{ color: theme.clay }}>▌</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
