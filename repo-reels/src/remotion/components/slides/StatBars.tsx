import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

// ---------------------------------------------------------------------------
// 4. Comparison bars + big metallic "↓ 50% ↓" headline (dark benchmark slide)
// ---------------------------------------------------------------------------

const BAR_COLORS = ["#9E9EA8", "#F0A24A", "#4CC38A", "#8B7CF6"];
const LEGEND_LABELS = ["baseline", "caveman", "ponytail", "yagni-oneliner"];
const GROUP_LABELS: [string, string][] = [
  ["LOC", "base 191"],
  ["tokens", "base 349k"],
  ["cost", "base $0.10"],
  ["time", "base 69s"],
];

const BAR_W = 26;
const BAR_GAP = 8;
const GROUP_GAP = 34;
const H100 = 210; // pixel height of the 100% mark
const CHART_H = 246; // headroom above 100% for >100% bars + labels

// Subtle metallic vertical gradient, clipped to the glyphs.
const metalText: React.CSSProperties = {
  backgroundImage: "linear-gradient(180deg, #FBFBFD 0%, #D8D8E0 42%, #74747E 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

export const StatBars: React.FC<{ headline: string; groups: number }> = ({ headline, groups }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nGroups = Math.max(1, Math.round(groups));
  const groupW = BAR_COLORS.length * BAR_W + (BAR_COLORS.length - 1) * BAR_GAP;
  const chartW = nGroups * groupW + (nGroups - 1) * GROUP_GAP;

  const head = spring({ frame, fps, config: { damping: 12, stiffness: 160 }, durationInFrames: 20 });
  const fadeIn = (delay: number) =>
    interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.coal, flexDirection: "column", alignItems: "center", paddingTop: 176 }}>
      {/* Giant headline with real down-arrow glyphs */}
      <div
        style={{
          fontFamily: theme.sans,
          fontWeight: 900,
          fontSize: 92,
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          gap: 30,
          filter: "drop-shadow(0 8px 22px rgba(0,0,0,0.55))",
          transform: `scale(${0.7 + head * 0.3})`,
          opacity: head,
        }}
      >
        <span style={{ ...metalText, fontSize: "0.86em" }}>{"↓"}</span>
        <span style={metalText}>{headline}</span>
        <span style={{ ...metalText, fontSize: "0.86em" }}>{"↓"}</span>
      </div>

      {/* Dim caption */}
      <div
        style={{
          marginTop: 34,
          fontFamily: theme.sans,
          fontWeight: 600,
          fontSize: 15,
          color: "rgba(255,255,255,0.48)",
          opacity: fadeIn(6),
        }}
      >
        Every metric vs the no-skill baseline (lower is better)
      </div>

      {/* Tiny legend row: colored squares + labels */}
      <div style={{ marginTop: 12, display: "flex", gap: 20, alignItems: "center", opacity: fadeIn(9) }}>
        {BAR_COLORS.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
            <span style={{ fontFamily: theme.sans, fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
              {LEGEND_LABELS[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div style={{ position: "relative", width: chartW, height: CHART_H, marginTop: 30 }}>
        {/* faint gridlines at 25/50/75% */}
        {[0.25, 0.5, 0.75].map((f) => (
          <div
            key={f}
            style={{ position: "absolute", left: -8, right: -8, bottom: H100 * f, height: 1, background: "rgba(255,255,255,0.06)" }}
          />
        ))}
        {/* dashed reference line at 100% */}
        <div
          style={{
            position: "absolute",
            left: -8,
            right: -8,
            bottom: H100,
            height: 0,
            borderTop: "1.5px dashed rgba(255,255,255,0.32)",
            opacity: fadeIn(10),
          }}
        />
        {/* tiny % ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <div
            key={f}
            style={{
              position: "absolute",
              left: -52,
              width: 38,
              bottom: H100 * f - 6,
              textAlign: "right",
              fontFamily: theme.sans,
              fontWeight: 600,
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              opacity: fadeIn(10),
            }}
          >
            {Math.round(f * 100)}%
          </div>
        ))}

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", gap: GROUP_GAP, alignItems: "flex-end" }}>
          {Array.from({ length: nGroups }).map((_, g) => (
            <div key={g} style={{ display: "flex", gap: BAR_GAP, alignItems: "flex-end" }}>
              {BAR_COLORS.map((c, b) => {
                // baseline is always 100%; the skill bars land between 46% and 107%
                const v = b === 0 ? 100 : Math.round(46 + random(`sb-${g}-${b}`) * 61);
                const s = spring({
                  frame: frame - (8 + g * 5 + b * 2),
                  fps,
                  config: { damping: 13, stiffness: 130, mass: 0.9 },
                  durationInFrames: 22,
                });
                const h = Math.max(0, (v / 100) * H100 * s);
                return (
                  <div key={b} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                    <div
                      style={{
                        width: BAR_W,
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 4,
                        opacity: interpolate(s, [0.7, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                        transform: `translateY(${(1 - Math.min(1, s)) * 6}px)`,
                      }}
                    >
                      <span style={{ fontFamily: theme.sans, fontWeight: 700, fontSize: 11, color: c, whiteSpace: "nowrap" }}>
                        {v}%
                      </span>
                    </div>
                    <div style={{ width: BAR_W, height: h, background: c, borderRadius: "5px 5px 0 0" }} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* hairline baseline axis */}
        <div style={{ position: "absolute", left: -8, right: -8, bottom: 0, height: 1, background: "rgba(255,255,255,0.3)" }} />
      </div>

      {/* Group labels under the bars */}
      <div style={{ display: "flex", gap: GROUP_GAP, marginTop: 10, opacity: fadeIn(14) }}>
        {Array.from({ length: nGroups }).map((_, g) => {
          const [name, sub] = GROUP_LABELS[g % GROUP_LABELS.length];
          return (
            <div key={g} style={{ width: groupW, textAlign: "center" }}>
              <div style={{ fontFamily: theme.sans, fontWeight: 700, fontSize: 13, color: "#C6C6CE" }}>{name}</div>
              <div style={{ fontFamily: theme.sans, fontWeight: 500, fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
                {sub}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
