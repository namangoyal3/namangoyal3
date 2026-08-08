import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

// ---------------------------------------------------------------------------
// 5. Installer card — matched against reference frames f_003..f_006:
//    ink document icon with </>, bold title, letter-spaced subtitle, thin
//    progress bar (ink fill -> orange glow at 100%), mono status left +
//    percent right, hand-drawn ink rays early, then italic serif digits
//    fanning in with small hand-drawn arrows pointing down at the icon.
// ---------------------------------------------------------------------------

const INK = "#20180F";
const CARD_W = 460;
const OVERLAY_W = 520;
const OVERLAY_H = 250;

// document + </> icon, drawn in thick ink strokes on paper fill
const DocIcon: React.FC = () => (
  <svg width={150} height={150} viewBox="0 0 150 150" style={{ display: "block" }}>
    {/* back document, offset right + down */}
    <rect x={48} y={30} width={90} height={112} rx={10} fill={theme.paper} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {/* front document with folded top-left corner */}
    <path
      d="M 34 8 L 86 8 Q 96 8 96 18 L 96 132 Q 96 142 86 142 L 18 142 Q 8 142 8 132 L 8 34 Z"
      fill={theme.paper}
      stroke={INK}
      strokeWidth={7}
      strokeLinejoin="round"
    />
    {/* fold flap */}
    <path d="M 34 8 L 34 34 L 8 34" fill={theme.paper} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {/* </> */}
    <polyline points="38,60 24,75 38,90" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="66,60 80,75 66,90" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    <line x1={58} y1={56} x2={46} y2={94} stroke={INK} strokeWidth={7} strokeLinecap="round" />
  </svg>
);

export const Installer: React.FC<{ title: string; subtitle: string; count: number }> = ({ title, subtitle, count }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const T = durationInFrames;
  const t = title.trim() || "Claude Code";
  const n = Math.max(1, Math.min(7, Math.round(count) || 5));

  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 14 });

  // phased progress: preparing -> download sprint -> configuring -> done
  const progress = interpolate(
    frame,
    [0.03 * T, 0.12 * T, 0.42 * T, 0.52 * T, 0.74 * T, 0.86 * T],
    [0, 0.05, 0.67, 0.7, 0.96, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const pct = Math.round(progress * 100);
  const done = pct >= 100;
  const glow = interpolate(frame, [0.86 * T, 0.93 * T], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const status = pct < 6 ? "Preparing…" : pct < 70 ? `Downloading ${t} Plugin…` : done ? `${t} Plugin installed` : "Configuring agent instructions…";

  // ---- overlay timings ----
  const raysStart = 0.1 * T;
  const numbersStart = 0.5 * T;
  const raysFade = interpolate(frame, [numbersStart - 8, numbersStart + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ---- hand-drawn ink rays (f_004) ----
  const rays: React.ReactNode[] = [];
  if (raysFade > 0.01) {
    for (let i = 0; i < 7; i++) {
      const jA = (random(`rayA${i}`) - 0.5) * 6;
      const a = ((-62 + (124 / 6) * i + jA) * Math.PI) / 180;
      const r0 = 52 + random(`rayR${i}`) * 14;
      const r1 = r0 + 62 + random(`rayL${i}`) * 24 + (Math.abs(a) / 1.08) * 20;
      const rm = (r0 + r1) / 2;
      const bend = (random(`rayB${i}`) - 0.5) * 12;
      const p = (r: number): [number, number] => [260 + Math.sin(a) * r, OVERLAY_H - Math.cos(a) * r];
      const [x0, y0] = p(r0);
      const [x1, y1] = p(r1);
      const cx = 260 + Math.sin(a) * rm + Math.cos(a) * bend;
      const cy = OVERLAY_H - Math.cos(a) * rm + Math.sin(a) * bend;
      const drawn = spring({ frame: frame - (raysStart + i * 1.5), fps, config: { damping: 200 }, durationInFrames: 10 });
      rays.push(
        <path
          key={`ray${i}`}
          d={`M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`}
          fill="none"
          stroke={INK}
          strokeWidth={3.4}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - Math.min(1, drawn)}
          opacity={raysFade}
        />,
      );
      if (i % 3 === 0) {
        // little ink dots below some rays, like the reference's splatter
        rays.push(<circle key={`dot${i}`} cx={x0 - Math.sin(a) * 12} cy={y0 + Math.cos(a) * 12} r={2.4} fill={INK} opacity={raysFade * Math.min(1, drawn)} />);
      }
    }
  }

  // ---- numbered digits fanning above the icon, with arrows (f_005/f_006) ----
  const half = n === 1 ? 0 : Math.min(170, 46 * (n - 1));
  const digits: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const off = n === 1 ? 0 : -half + ((2 * half) / (n - 1)) * i;
    const norm = off / 170;
    const dy = 48 + norm * norm * 70;
    const dx = 260 + off;
    const s = spring({ frame: frame - (numbersStart + i * 3), fps, config: { damping: 11, stiffness: 130, mass: 0.7 }, durationInFrames: 18 });
    const scale = 0.5 + 0.5 * s;
    const opacity = Math.max(0, Math.min(1, s * 1.8));
    digits.push(
      <text
        key={`num${i}`}
        transform={`translate(${dx} ${dy}) rotate(${norm * 9}) scale(${scale})`}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#D86A52"
        opacity={opacity}
        style={{ fontFamily: theme.serif, fontStyle: "italic", fontWeight: 800, fontSize: n > 5 ? 54 : 62 }}
      >
        {i + 1}
      </text>,
    );

    // thin hand-drawn arrow curving from below the digit toward the icon
    const sx = 260 + off * 0.95;
    const sy = dy + 40;
    const ex = 260 + off * 0.3;
    const ey = OVERLAY_H - 44 + Math.abs(norm) * 20;
    const cxp = (sx + ex) / 2 + off * 0.12;
    const cyp = (sy + ey) / 2 - 4;
    const drawn = spring({ frame: frame - (numbersStart + i * 3 + 5), fps, config: { damping: 200 }, durationInFrames: 12 });
    const th = Math.atan2(ey - cyp, ex - cxp);
    const headAt = (d: number): string => `M ${ex} ${ey} L ${ex - 10 * Math.cos(th + d)} ${ey - 10 * Math.sin(th + d)}`;
    digits.push(
      <g key={`arr${i}`} stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none">
        <path d={`M ${sx} ${sy} Q ${cxp} ${cyp} ${ex} ${ey}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, drawn)} />
        {drawn > 0.85 ? (
          <>
            <path d={headAt(0.5)} />
            <path d={headAt(-0.5)} />
          </>
        ) : null}
      </g>,
    );
  }

  const barFill = done ? "#E0714B" : "#241E16";
  const statusColor = done ? "#CE6647" : "#877D6C";

  return (
    <AbsoluteFill style={{ backgroundColor: theme.cream, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: CARD_W,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: rise,
          transform: `translateY(${-70 + (1 - rise) * 24}px)`,
        }}
      >
        {/* icon with the rays / numbered fan hovering above it */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg
            width={OVERLAY_W}
            height={OVERLAY_H}
            viewBox={`0 0 ${OVERLAY_W} ${OVERLAY_H}`}
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: -14,
              overflow: "visible",
            }}
          >
            {rays}
            {digits}
          </svg>
          <DocIcon />
        </div>

        <div style={{ fontFamily: theme.sans, fontWeight: 800, fontSize: 46, letterSpacing: -0.5, color: "#1A1712", lineHeight: 1.1 }}>{t}</div>
        <div style={{ fontFamily: theme.sans, fontWeight: 600, fontSize: 14, letterSpacing: 4.5, color: "#8B8271", marginTop: 8 }}>
          {(subtitle.trim() || "PLUGIN INSTALLER").toUpperCase()}
        </div>

        {/* progress bar */}
        <div style={{ width: "100%", marginTop: 30 }}>
          <div style={{ height: 13, borderRadius: 7, background: "#D6CDBB", overflow: "visible", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${Math.max(pct, 0.5)}%`,
                borderRadius: 7,
                background: barFill,
                boxShadow: done ? `0 0 ${16 * glow}px rgba(230,122,81,${0.6 * glow})` : "none",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 11 }}>
            <span style={{ fontFamily: theme.mono, fontSize: 13.5, color: statusColor, display: "flex", alignItems: "center" }}>
              {done ? (
                <svg width={13} height={13} viewBox="0 0 14 14" style={{ marginRight: 8, display: "inline-block" }}>
                  <polyline points="2,7.5 5.5,11 12,3" fill="none" stroke={statusColor} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
              {status}
            </span>
            <span style={{ fontFamily: theme.mono, fontSize: 13.5, fontWeight: 700, color: statusColor }}>{pct}%</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
