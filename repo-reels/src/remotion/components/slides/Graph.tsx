import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { PixelMascot, Pill, useRise } from "./shared";

// ---------------------------------------------------------------------------
// 7. Knowledge graph — nodes and links light up
// ---------------------------------------------------------------------------

export const Graph: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = 640;
  const H = 560;
  const NODES = 42;
  const nodes = Array.from({ length: NODES }).map((_, i) => {
    const a = random(`ga-${i}`) * Math.PI * 2;
    const r = 40 + random(`gr-${i}`) * 240;
    return { x: W / 2 + Math.cos(a) * r * (0.82 + random(`gx-${i}`) * 0.3), y: H / 2 + Math.sin(a) * r * 0.82, s: 2 + random(`gs-${i}`) * 5 };
  });
  const edges: [number, number][] = [];
  for (let i = 0; i < NODES; i++) {
    const j = Math.floor(random(`ge-${i}`) * NODES);
    if (j !== i) edges.push([i, j]);
  }
  const lit = interpolate(frame, [0, fps * 2.4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: theme.coal, alignItems: "center", justifyContent: "center" }}>
      <svg width={W} height={H}>
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke={i / edges.length < lit ? "rgba(139,124,246,0.5)" : "rgba(255,255,255,0.08)"}
            strokeWidth={1.2}
          />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.s} fill={i / NODES < lit ? "#B9AFFB" : "rgba(255,255,255,0.28)"} />
        ))}
        {label ? (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontFamily={theme.mono} fontSize={17} fill="#D8D8DE">
            {label}
          </text>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
