import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

export const PixelMascot: React.FC<{ size?: number }> = ({ size = 64 }) => {
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

export const Pill: React.FC<{ children: React.ReactNode; bg?: string; fg?: string }> = ({ children, bg = "#2A2A31", fg = "#D8D8DE" }) => (
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

export const useRise = (delayFrames = 0, dur = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delayFrames, fps, config: { damping: 200 }, durationInFrames: dur });
  return { opacity: s, transform: `translateY(${(1 - s) * 24}px)` };
};
