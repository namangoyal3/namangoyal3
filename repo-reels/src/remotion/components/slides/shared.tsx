import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

export const PixelMascot: React.FC<{ size?: number }> = ({ size = 64 }) => {
  // 8-bit critter matching the reference: wide clay body, raised head-block on
  // the top right, two square dark eyes, stub arms on both sides, four legs.
  // Grid is 12 cols x 7 rows. X = clay body, E = dark eye.
  const G = [
    "......XXX...",
    ".XXXXXXXXXX.",
    "XXEXXXXEXXXX",
    "XXXXXXXXXXXX",
    ".XXXXXXXXXX.",
    ".XXXXXXXXXX.",
    ".X..X..X..X.",
  ];
  const cell = size / 12;
  const bleed = cell * 0.06; // hide antialiasing seams between adjacent cells
  const body: React.ReactNode[] = [];
  const eyes: React.ReactNode[] = [];
  G.forEach((row, y) => {
    // merge consecutive body cells into single rects (fewer seams)
    let run = -1;
    for (let x = 0; x <= row.length; x++) {
      const c = row[x];
      const isBody = c === "X" || c === "E";
      if (isBody && run < 0) run = x;
      if (!isBody && run >= 0) {
        body.push(
          <rect
            key={`b${y}-${run}`}
            x={run * cell - bleed}
            y={y * cell - bleed}
            width={(x - run) * cell + bleed * 2}
            height={cell + bleed * 2}
            fill={theme.clay}
          />,
        );
        run = -1;
      }
      if (c === "E") {
        eyes.push(<rect key={`e${y}-${x}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="#1A0E0B" />);
      }
    }
  });
  return (
    <svg width={size} height={cell * 7} viewBox={`0 0 ${size} ${cell * 7}`} style={{ display: "block" }} shapeRendering="crispEdges">
      {body}
      {eyes}
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
