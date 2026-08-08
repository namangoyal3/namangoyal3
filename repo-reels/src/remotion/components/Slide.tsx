import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { SlideSpec } from "../../types";
import { theme } from "../theme";

export const Slide: React.FC<{ spec: SlideSpec }> = ({ spec }) => {
  const p = spec.props as any;
  switch (spec.kind) {
    case "kinetic":
      return <Kinetic text={String(p.text ?? "")} />;
    case "repoCard":
      return <RepoCard {...p} />;
    case "starHistory":
      return <StarHistory fullName={String(p.fullName ?? "")} stars={Number(p.stars ?? 1000)} />;
    case "statBars":
      return <StatBars headline={String(p.headline ?? "50%")} groups={Number(p.groups ?? 4)} />;
    case "installer":
      return <Installer title={String(p.title ?? "")} subtitle={String(p.subtitle ?? "INSTALLER")} count={Number(p.count ?? 5)} />;
    case "fileTree":
      return <FileTree rows={(p.rows as string[]) ?? []} />;
    case "graph":
      return <Graph label={String(p.label ?? "")} />;
    case "terminal":
      return <Terminal title={String(p.title ?? "")} lines={(p.lines as string[]) ?? []} />;
    case "cta":
      return <Cta keyword={String(p.keyword ?? "REPO")} />;
    default:
      return <AbsoluteFill style={{ backgroundColor: theme.cream }} />;
  }
};

// ---------------------------------------------------------------------------
// shared bits
// ---------------------------------------------------------------------------

const PixelMascot: React.FC<{ size?: number }> = ({ size = 64 }) => {
  // 8-bit critter in the accent clay — the reference's signature detail.
  const G = [
    "..XX..XX..",
    "..XXXXXX..",
    ".XXXXXXXX.",
    ".XX.XX.XX.",
    ".XXXXXXXX.",
    "..XXXXXX..",
    ".X.X..X.X.",
    "X..X..X..X",
  ];
  const cell = size / 10;
  return (
    <svg width={size} height={(size * 8) / 10} style={{ display: "block" }}>
      {G.flatMap((row, y) =>
        row.split("").map((c, x) =>
          c === "X" ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={theme.clay} /> : null,
        ),
      )}
    </svg>
  );
};

const Pill: React.FC<{ children: React.ReactNode; bg?: string; fg?: string }> = ({ children, bg = "#2A2A31", fg = "#D8D8DE" }) => (
  <span
    style={{
      fontFamily: theme.sans,
      fontSize: 15,
      fontWeight: 700,
      color: fg,
      background: bg,
      borderRadius: 6,
      padding: "4px 10px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const useRise = (delayFrames = 0, dur = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delayFrames, fps, config: { damping: 200 }, durationInFrames: dur });
  return { opacity: s, transform: `translateY(${(1 - s) * 24}px)` };
};

// ---------------------------------------------------------------------------
// 1. Kinetic rank title — cream bg, giant italic serif, staggered words
// ---------------------------------------------------------------------------

const Kinetic: React.FC<{ text: string }> = ({ text }) => {
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

// ---------------------------------------------------------------------------
// 2. Repo showcase card — dark GitHub-README style
// ---------------------------------------------------------------------------

const RepoCard: React.FC<{
  name: string;
  fullName: string;
  tagline: string;
  stars: string;
  version?: string;
  language?: string;
  license?: string;
  metrics?: string[];
}> = ({ name, fullName, tagline, stars, version, language, license, metrics = [] }) => {
  const rise0 = useRise(0);
  const rise1 = useRise(6);
  const rise2 = useRise(12);
  return (
    <AbsoluteFill style={{ backgroundColor: theme.coal, alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ ...rise0, background: theme.clay, borderRadius: 10, padding: "10px 26px" }}>
          <span style={{ fontFamily: theme.mono, fontSize: 40, fontWeight: 700, color: theme.coal }}>{name}</span>
        </div>
        <div style={{ ...rise0, fontFamily: theme.sans, fontSize: 16, color: theme.dim }}>{fullName}</div>

        <div style={{ ...rise1, fontFamily: theme.serif, fontStyle: "italic", fontSize: 26, color: theme.white, textAlign: "center", lineHeight: 1.35 }}>
          {tagline}
        </div>

        <div style={{ ...rise1, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Pill>stars <span style={{ color: theme.white }}>{stars}</span></Pill>
          {version ? <Pill>release <span style={{ color: "#7EE787" }}>{version}</span></Pill> : null}
          {language ? <Pill>{language}</Pill> : null}
          {license ? <Pill>license <span style={{ color: "#79C0FF" }}>{license}</span></Pill> : null}
        </div>

        <div style={{ ...rise2, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Pill bg="#EFE7D2" fg="#7A5A16">🏅 #1 Repository Of The Day</Pill>
          <Pill bg="#EFE7D2" fg="#7A5A16">🏅 Trending This Week</Pill>
        </div>

        {metrics.length ? (
          <div style={{ ...rise2, fontFamily: theme.sans, fontSize: 17, color: "#BDBDC7", textAlign: "center" }}>
            {metrics.join("  ·  ")}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 3. Star-history chart — line draws itself left to right
// ---------------------------------------------------------------------------

const StarHistory: React.FC<{ fullName: string; stars: number }> = ({ fullName, stars }) => {
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

// ---------------------------------------------------------------------------
// 4. Comparison bars + big headline
// ---------------------------------------------------------------------------

const BAR_COLORS = ["#9E9EA8", "#F0A24A", "#4CC38A", "#8B7CF6"];

const StatBars: React.FC<{ headline: string; groups: number }> = ({ headline, groups }) => {
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

// ---------------------------------------------------------------------------
// 5. Installer card — progress bar with phases + numbered fan
// ---------------------------------------------------------------------------

const Installer: React.FC<{ title: string; subtitle: string; count: number }> = ({ title, subtitle, count }) => {
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

// ---------------------------------------------------------------------------
// 6. File tree with sweeping highlight
// ---------------------------------------------------------------------------

const FileTree: React.FC<{ rows: string[] }> = ({ rows }) => {
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

// ---------------------------------------------------------------------------
// 7. Knowledge graph — nodes and links light up
// ---------------------------------------------------------------------------

const Graph: React.FC<{ label: string }> = ({ label }) => {
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

// ---------------------------------------------------------------------------
// 8. Terminal window with typed lines + pixel mascot
// ---------------------------------------------------------------------------

const Terminal: React.FC<{ title: string; lines: string[] }> = ({ title, lines }) => {
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

// ---------------------------------------------------------------------------
// 9. CTA — "comment «KEYWORD»" lockup
// ---------------------------------------------------------------------------

const Cta: React.FC<{ keyword: string }> = ({ keyword }) => {
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
