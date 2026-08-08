import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { PixelMascot, Pill, useRise } from "./shared";

// ---------------------------------------------------------------------------
// 3. Star-history chart — line draws itself left to right
// ---------------------------------------------------------------------------

export const StarHistory: React.FC<{ fullName: string; stars: number }> = ({ fullName, stars }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const W = 600;
  const H = 420;
  const pad = { l: 70, r: 30, t: 46, b: 44 };

  // S-shaped growth curve ending at the current star count
  const N = 60;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    const y = Math.pow(x, 2.6) * (0.85 + 0.15 * Math.sin(x * 9) * x);
    pts.push([pad.l + x * (W - pad.l - pad.r), H - pad.b - y * (H - pad.t - pad.b)]);
  }
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const progress = interpolate(frame, [4, Math.min(durationInFrames - 4, fps * 2.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dash = 2200;

  const yTicks = [0.25, 0.5, 0.75, 1].map((f) => ({
    label: `${Math.round((stars * f) / 1000)}k`,
    y: H - pad.b - f * (H - pad.t - pad.b),
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: theme.coal, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: theme.sans, fontWeight: 700, fontSize: 22, color: theme.white, marginBottom: 8 }}>
        <span style={{ color: "#F5B841" }}>★</span> Star History
      </div>
      <svg width={W} height={H}>
        <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="#3A3A42" strokeWidth={2} />
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="#3A3A42" strokeWidth={2} />
        {yTicks.map((t, i) => (
          <g key={i}>
            <text x={pad.l - 12} y={t.y + 5} textAnchor="end" fontFamily={theme.sans} fontSize={14} fill="#7C7C88">
              {t.label}
            </text>
            <line x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y} stroke="#26262d" strokeWidth={1} />
          </g>
        ))}
        <path d={d} fill="none" stroke={theme.clay} strokeWidth={4} strokeDasharray={dash} strokeDashoffset={dash * (1 - progress)} strokeLinecap="round" />
        {progress > 0.02 ? (
          <circle
            cx={pts[Math.min(N, Math.floor(progress * N))][0]}
            cy={pts[Math.min(N, Math.floor(progress * N))][1]}
            r={7}
            fill={theme.clay}
          />
        ) : null}
        <text x={pad.l + 8} y={pad.t - 14} fontFamily={theme.mono} fontSize={15} fill="#BDBDC7">
          ● {fullName}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
