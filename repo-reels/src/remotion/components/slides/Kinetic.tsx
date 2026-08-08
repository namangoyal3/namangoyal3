import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

// ---------------------------------------------------------------------------
// 1. Kinetic rank title — cream bg, giant Playfair italic caps, staggered words.
//    First word = rank word in salmon gradient (light-fade toward the bottom,
//    like the reference "SECOND"/"THIRD"/"FOURTH"); remaining words stack
//    below in near-black with slight alternating offsets (like "YOU'LL").
// ---------------------------------------------------------------------------

// Fit an all-caps Playfair italic word into a horizontal budget (px).
const fitSize = (word: string, budget: number, max: number) =>
  Math.max(54, Math.min(max, budget / (0.62 * Math.max(3, word.length))));

export const Kinetic: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.trim().split(/\s+/).filter(Boolean);

  const firstSize = fitSize(words[0] ?? "", 640, 150);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.cream }}>
      {/* faint paper feel — center-lit sheet, gently darker edges (no images) */}
      <AbsoluteFill
        style={{
          background: [
            "radial-gradient(135% 95% at 50% 30%, rgba(255,252,243,0.8) 0%, rgba(255,252,243,0) 58%)",
            "radial-gradient(130% 110% at 50% 112%, rgba(158,140,108,0.16) 0%, rgba(158,140,108,0) 62%)",
            `radial-gradient(160% 130% at 50% 50%, rgba(0,0,0,0) 62%, ${theme.creamDeep} 130%)`,
          ].join(", "),
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {/* lift the stack so it survives a crop to the top 58% of frame */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: "translateY(-115px)",
          }}
        >
          {words.map((w, i) => {
            const s = spring({
              frame: frame - i * 6,
              fps,
              config: { damping: 16, stiffness: 130 },
              durationInFrames: 24,
            });
            const blur = (1 - s) * 9;
            const track = interpolate(s, [0, 1], [9, -3]);
            const isRank = i === 0;
            const size = isRank ? firstSize : Math.min(firstSize * 0.66, fitSize(w, 600, 150));
            // subtle alternating horizontal offset for the lower words,
            // like "YOU'LL" tucked left under "PLUGINS" in the reference
            const shiftX = isRank ? 0 : i % 2 === 1 ? -24 : 18;

            const base: React.CSSProperties = {
              fontFamily: theme.serif,
              fontStyle: "italic",
              fontWeight: 800,
              fontSize: size,
              lineHeight: 1.04,
              letterSpacing: track,
              whiteSpace: "nowrap",
              opacity: Math.min(1, s * 1.15),
              transform: `translate(${shiftX}px, ${(1 - s) * 34}px) scale(${0.93 + s * 0.07})`,
            };

            if (isRank) {
              return (
                <span
                  key={i}
                  style={{
                    ...base,
                    color: theme.salmon,
                    background:
                      "linear-gradient(178deg, #D9744F 0%, #E18B72 34%, #E8927C 52%, #EFB39A 80%, #F4CDB6 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: `blur(${blur}px) drop-shadow(0 10px 14px rgba(146,72,46,0.28))`,
                  }}
                >
                  {w}
                </span>
              );
            }
            return (
              <span
                key={i}
                style={{
                  ...base,
                  marginTop: i === 1 ? size * -0.06 : size * 0.02,
                  color: theme.ink,
                  textShadow: "0 10px 22px rgba(20,20,20,0.22), 0 3px 4px rgba(20,20,20,0.14)",
                  filter: `blur(${blur}px)`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
