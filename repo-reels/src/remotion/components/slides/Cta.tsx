import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

// ---------------------------------------------------------------------------
// 9. CTA — `comment "KEYWORD"` lockup: small Playfair italic "comment" tilted
//    like handwriting, giant Inter 900 keyword in quotes tucked tightly under
//    it, white with a soft warm glow on a center-lit dark vignette.
// ---------------------------------------------------------------------------

export const Cta: React.FC<{ keyword: string }> = ({ keyword }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 14 });
  const s2 = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 160 }, durationInFrames: 20 });
  const s3 = spring({ frame: frame - 16, fps, config: { damping: 200 }, durationInFrames: 16 });

  // keep long keywords (plus quotes) inside the 720px frame
  const kwSize = Math.max(48, Math.min(96, 600 / (0.62 * (keyword.length + 2))));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.coal,
        background: `radial-gradient(85% 62% at 50% 40%, #1E1E24 0%, #131318 48%, ${theme.coal} 100%)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* nudged up so the full lockup stays inside a crop to the top 58% */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: "translateY(-72px)",
        }}
      >
        <span
          style={{
            fontFamily: theme.serif,
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 58,
            lineHeight: 1,
            color: theme.white,
            textShadow: "0 3px 14px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.4)",
            opacity: s1,
            transform: `translateY(${(1 - s1) * 22}px) rotate(-2deg)`,
            marginBottom: -20,
            zIndex: 2,
          }}
        >
          comment
        </span>
        <span
          style={{
            fontFamily: theme.sans,
            fontWeight: 900,
            fontSize: kwSize,
            lineHeight: 1.06,
            letterSpacing: -2,
            color: theme.white,
            textShadow:
              "0 4px 22px rgba(0,0,0,0.6), 0 0 44px rgba(232,146,124,0.38), 0 0 90px rgba(222,107,72,0.22)",
            opacity: s2,
            transform: `scale(${0.85 + s2 * 0.15})`,
            filter: `blur(${(1 - s2) * 5}px)`,
          }}
        >
          "{keyword}"
        </span>
        <span
          style={{
            fontFamily: theme.sans,
            fontWeight: 500,
            fontSize: 20,
            letterSpacing: 0.3,
            color: theme.dim,
            marginTop: 30,
            opacity: s3,
            transform: `translateY(${(1 - s3) * 10}px)`,
          }}
        >
          and I’ll send you the links
        </span>
      </div>
    </AbsoluteFill>
  );
};
