import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

// ---------------------------------------------------------------------------
// 3. Star-history chart — star-history.com style: white rounded card floating
//    on the dark slide, thin gray axes, K-formatted ticks, orange-red line
//    with dots that draws itself left to right behind a bouncing leading dot.
// ---------------------------------------------------------------------------

const LINE = "#E0674D";
const AXIS = "#3B3B3B";
const TICK_INK = "#8A8A8A";

// n-spiked star / burst as an SVG polygon points string (no emoji glyphs).
const starPoints = (cx: number, cy: number, spikes: number, outer: number, inner: number) => {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(" ");
};

const fmtTick = (v: number) => {
  if (v >= 9500) return `${Math.round(v / 1000)}K`;
  if (v >= 950) return `${(v / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${Math.max(1, Math.round(v))}`;
};

export const StarHistory: React.FC<{ fullName: string; stars: number }> = ({ fullName, stars }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Plot geometry (inside the white card)
  const W = 620;
  const H = 470;
  const pad = { l: 78, r: 26, t: 44, b: 64 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const HEADROOM = 1.12; // value-axis max = stars * HEADROOM, so the curve tops out below the plot ceiling
  const yFor = (v01: number) => H - pad.b - (v01 / HEADROOM) * plotH;

  // Deterministic hockey-stick growth curve ending exactly at `stars`.
  const N = 16;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    const wiggle = i === 0 || i === N ? 0 : (random(`sh-${i}`) - 0.5) * 0.035 * x;
    const v = Math.min(1, Math.max(0, Math.pow(x, 2.7) + wiggle));
    pts.push([pad.l + x * plotW, yFor(i === N ? 1 : v)]);
  }
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  // Arc-length parametrization so the leading dot rides the true path tip.
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = cum[cum.length - 1];

  // ~2.2s draw-on, clamped inside the slide.
  const drawStart = 10;
  const drawEnd = Math.max(drawStart + 1, Math.min(durationInFrames - 5, drawStart + Math.round(fps * 2.2)));
  const progress = interpolate(frame, [drawStart, drawEnd], [0, 1], {
    easing: Easing.bezier(0.42, 0, 0.4, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s = progress * total;
  let tip = pts[pts.length - 1];
  for (let i = 1; i < pts.length; i++) {
    if (cum[i] >= s) {
      const t = (s - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
      tip = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
      break;
    }
  }
  // Overshoot bounce on the leading dot as the line completes.
  const pop = spring({ frame: frame - drawEnd, fps, config: { damping: 9, stiffness: 170 }, durationInFrames: 26 });
  const tipR = 6 * (1 + 0.5 * Math.sin(Math.PI * Math.min(1, Math.max(0, pop))));

  const yTicks = [0.25, 0.5, 0.75, 1].map((f) => ({ label: fmtTick(stars * f), y: yFor(f) }));
  const xTicks = [
    { f: 0.13, label: "October" },
    { f: 0.46, label: "2026" },
    { f: 0.76, label: "April" },
  ];

  const chipX = pad.l + 12;
  const chipY = pad.t + 4;
  const chipW = 42 + fullName.length * 7.9;
  const chipIn = interpolate(frame, [6, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cardIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 16 });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.coal, flexDirection: "column", alignItems: "center", paddingTop: 132 }}>
      <div
        style={{
          background: theme.white,
          borderRadius: 22,
          padding: "16px 16px 6px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 6px 20px rgba(0,0,0,0.35)",
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 34}px) scale(${0.96 + cardIn * 0.04})`,
        }}
      >
        {/* Tiny title: orange starburst + "Star History" */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 4, marginBottom: 2 }}>
          <svg width={26} height={26}>
            <polygon points={starPoints(13, 13, 12, 11.5, 4.6)} fill="#E8862E" />
            <circle cx={13} cy={13} r={3.4} fill="#C96A1B" />
          </svg>
          <span style={{ fontFamily: theme.mono, fontWeight: 700, fontSize: 21, color: "#2B2B2B" }}>Star History</span>
        </div>

        <svg width={W} height={H} style={{ display: "block" }}>
          {/* Thin gray axes with a slight hand-drawn overhang */}
          <line x1={pad.l} y1={pad.t - 10} x2={pad.l} y2={H - pad.b + 1} stroke={AXIS} strokeWidth={1.6} strokeLinecap="round" />
          <line x1={pad.l - 1} y1={H - pad.b} x2={W - pad.r + 10} y2={H - pad.b} stroke={AXIS} strokeWidth={1.6} strokeLinecap="round" />

          {/* Y ticks — 25/50/75/100% of the star count */}
          {yTicks.map((t, i) => (
            <text key={i} x={pad.l - 10} y={t.y + 4} textAnchor="end" fontFamily={theme.mono} fontSize={12.5} fill={TICK_INK}>
              {t.label}
            </text>
          ))}
          {/* X ticks — date labels */}
          {xTicks.map((t, i) => (
            <text key={i} x={pad.l + t.f * plotW} y={H - pad.b + 24} textAnchor="middle" fontFamily={theme.mono} fontSize={12.5} fill={TICK_INK}>
              {t.label}
            </text>
          ))}
          {/* Axis titles */}
          <text
            transform={`translate(18 ${pad.t + plotH / 2}) rotate(-90)`}
            textAnchor="middle"
            fontFamily={theme.mono}
            fontSize={11}
            fill="#9A9A9A"
          >
            GitHub Stars
          </text>
          <text x={pad.l + plotW / 2} y={H - pad.b + 46} textAnchor="middle" fontFamily={theme.mono} fontSize={11} fill="#9A9A9A">
            Date
          </text>

          {/* The line, revealed by exact arc length */}
          <path
            d={d}
            fill="none"
            stroke={LINE}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={total}
            strokeDashoffset={total * (1 - progress)}
          />
          {/* Data-point dots appear as the tip passes them */}
          {pts.map(([x, y], i) =>
            progress > 0 && cum[i] <= s ? <circle key={i} cx={x} cy={y} r={3.6} fill={LINE} /> : null,
          )}
          {/* Leading dot with halo + completion bounce */}
          {progress > 0.005 ? (
            <g>
              <circle cx={tip[0]} cy={tip[1]} r={tipR + 5} fill={LINE} opacity={0.16} />
              <circle cx={tip[0]} cy={tip[1]} r={tipR} fill={LINE} />
            </g>
          ) : null}

          {/* Legend chip inside the plot, top-left */}
          <g opacity={chipIn}>
            <rect x={chipX} y={chipY} width={chipW} height={30} rx={3} fill={theme.white} stroke="#3F3F3F" strokeWidth={1.3} />
            <circle cx={chipX + 17} cy={chipY + 15} r={4.5} fill={LINE} />
            <text x={chipX + 30} y={chipY + 20} fontFamily={theme.mono} fontSize={13} fill="#333333">
              {fullName}
            </text>
          </g>

          {/* Watermark: green star polygon + star-history.com, bottom-right */}
          <g opacity={0.9}>
            <polygon points={starPoints(W - 124, H - 13, 5, 7.5, 3.1)} fill="#7FA650" />
            <text x={W - 112} y={H - 9} fontFamily={theme.mono} fontSize={12} fill="#9B9B9B">
              star-history.com
            </text>
          </g>
        </svg>
      </div>
    </AbsoluteFill>
  );
};
