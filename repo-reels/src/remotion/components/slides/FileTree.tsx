import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

// ---------------------------------------------------------------------------
// 6. File tree — dark GitHub directory listing with a sweeping orange band
// ---------------------------------------------------------------------------

const CARD_W = 584;
const CARD_TOP = 104; // card lives inside the top-58% crop band
const ROW_H = 46;
const HEADER_H = 34;
const DATA_ROWS = 12; // + the ".." row = 13 rows ≈ 634px tall card
const BAND_ROWS = 4;

const PAD_POOL = [
  "docs",
  "examples",
  "scripts",
  "templates",
  "integrations",
  "workflows",
  "plugins",
  "recipes",
  "benchmarks",
  "guides",
  "utils",
  "configs",
  "assets",
  "tooling",
];

const MSG = [
  (n: string) => `Add LICENSE files and docs to ${n}`,
  (n: string) => `fix: handle edge cases in ${n}`,
  (n: string) => `${n}: simplify README; cleanup config`,
  (n: string) => `Add integration tests covering ${n}`,
  (n: string) => `refactor: tighten ${n} internals`,
  (n: string) => `update ${n} examples and defaults`,
];

const AGE = ["2 days ago", "5 days ago", "last week", "2 weeks ago", "3 weeks ago", "last month", "2 months ago", "4 months ago", "5 months ago"];

const sanitize = (s: string) => {
  const clean = s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 22);
  return clean;
};

const buildRows = (rows: string[]): string[] => {
  const out: string[] = [];
  const used = new Set<string>();
  for (const r of rows) {
    const s = sanitize(r);
    if (s && !used.has(s)) {
      used.add(s);
      out.push(s);
    }
    if (out.length >= DATA_ROWS) break;
  }
  for (const p of PAD_POOL) {
    if (out.length >= DATA_ROWS) break;
    if (!used.has(p)) {
      used.add(p);
      out.push(p);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
};

const FolderIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" style={{ flex: "0 0 auto", display: "block" }}>
    <path
      d="M1.75 2.5h3.86c.33 0 .64.15.85.4l.9 1.1h6.89c.69 0 1.25.56 1.25 1.25v7c0 .69-.56 1.25-1.25 1.25H1.75c-.69 0-1.25-.56-1.25-1.25v-8.5c0-.69.56-1.25 1.25-1.25z"
      fill="#737A85"
    />
  </svg>
);

export const FileTree: React.FC<{ rows: string[] }> = ({ rows }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const list = buildRows(rows.length ? rows : ["core", "cli", "docs", "examples"]);
  const total = list.length + 1; // ".." row on top, like GitHub

  // orange band sweeps from the top rows down the list over the segment
  const bandRow = interpolate(frame, [10, Math.max(20, durationInFrames - 12)], [0, total - BAND_ROWS], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const appear = interpolate(frame, [0, 9], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });

  const dim = "#61656D";
  const rowBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: ROW_H,
    padding: "0 16px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    boxSizing: "border-box",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: theme.coal }}>
      <div
        style={{
          position: "absolute",
          top: CARD_TOP,
          left: (720 - CARD_W) / 2,
          width: CARD_W,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "#101015",
          overflow: "hidden",
          opacity: appear,
          transform: `translateY(${(1 - appear) * 14}px)`,
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: HEADER_H,
            padding: "0 16px",
            fontFamily: theme.sans,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: "#565A62",
            background: "#14141A",
            boxSizing: "border-box",
          }}
        >
          <span style={{ width: 216 }}>Name</span>
          <span style={{ flex: 1 }}>Last commit message</span>
          <span style={{ width: 110, textAlign: "right" }}>Last commit date</span>
        </div>

        {/* rows + sweeping highlight */}
        <div style={{ position: "relative" }}>
          {/* ".." row */}
          <div style={{ ...rowBase, borderTop: "none" }}>
            <FolderIcon />
            <span style={{ fontFamily: theme.sans, fontWeight: 500, fontSize: 15, color: "#9BA0A8" }}>..</span>
          </div>

          {list.map((name, i) => {
            const msg = MSG[Math.floor(random(`msg-${name}`) * MSG.length)](name);
            const age = AGE[Math.floor(random(`age-${name}`) * AGE.length)];
            return (
              <div key={`${name}-${i}`} style={rowBase}>
                <FolderIcon />
                <span
                  style={{
                    fontFamily: theme.sans,
                    fontWeight: 500,
                    fontSize: 15,
                    color: "#D6D9DE",
                    width: 190,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {name}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontFamily: theme.sans,
                    fontSize: 13,
                    color: dim,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {msg}
                </span>
                <span
                  style={{
                    width: 104,
                    textAlign: "right",
                    fontFamily: theme.sans,
                    fontSize: 12.5,
                    color: dim,
                    whiteSpace: "nowrap",
                  }}
                >
                  {age}
                </span>
              </div>
            );
          })}

          {/* orange marker band spanning BAND_ROWS rows */}
          <div
            style={{
              position: "absolute",
              left: 5,
              right: 5,
              top: bandRow * ROW_H,
              height: BAND_ROWS * ROW_H,
              border: `3px solid ${theme.clay}`,
              borderRadius: 10,
              background: "rgba(222,107,72,0.06)",
              boxShadow: "0 0 16px rgba(222,107,72,0.18)",
              boxSizing: "border-box",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
