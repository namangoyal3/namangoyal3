import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../../theme";
import { useRise } from "./shared";

// ---------------------------------------------------------------------------
// 2. Repo showcase card — dark GitHub-README screenshot style
// ---------------------------------------------------------------------------

// Gold medal with red ribbon triangles — SVG, never emoji (emoji render as boxes).
const Medal: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" style={{ display: "block" }}>
    <polygon points="7,0 12,0 15,10 9,12" fill="#D14B3D" />
    <polygon points="14,0 19,0 17,12 11,10" fill="#A5382C" />
    <circle cx="13" cy="17" r="8" fill="#F2C14E" stroke="#B98A1E" strokeWidth="1.6" />
    <circle cx="13" cy="17" r="5.2" fill="none" stroke="#D9A93B" strokeWidth="1" />
    <text
      x="13"
      y="20.4"
      textAnchor="middle"
      fontFamily={theme.sans}
      fontSize="9.5"
      fontWeight="800"
      fill="#7A5A16"
    >
      1
    </text>
  </svg>
);

// GitHub-badge style two-tone pill: dim gray label half + colored value half.
const Badge: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = theme.white }) => (
  <span
    style={{
      display: "inline-flex",
      borderRadius: 4,
      overflow: "hidden",
      fontFamily: theme.sans,
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1,
      whiteSpace: "nowrap",
    }}
  >
    <span style={{ background: "#33333B", color: "#C9C9D2", padding: "5px 7px" }}>{label}</span>
    <span style={{ background: "#1C1C23", color, padding: "5px 8px" }}>{value}</span>
  </span>
);

// Cream trending-award pill with SVG medal + small-caps dark-gold text.
const MedalPill: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 9,
      background: "#EFE7D2",
      border: "1px solid #DED7C4",
      borderRadius: 9,
      padding: "6px 14px",
    }}
  >
    <Medal size={25} />
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
      <span style={{ fontFamily: theme.sans, fontSize: 7, fontWeight: 700, letterSpacing: 2.2, color: "#A08A4E" }}>
        GITHUB TRENDING
      </span>
      <span
        style={{
          fontFamily: theme.sans,
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: 0.5,
          color: "#7A5A16",
          textTransform: "uppercase",
        }}
      >
        {text}
      </span>
    </div>
  </div>
);

const LINK_BLUE = "#58A6FF";
const FOOTER_LINKS = ["Quick Start", "How It Works", "Documentation", "License"];

export const RepoCard: React.FC<{
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
  const rise1 = useRise(4);
  const rise2 = useRise(8);
  const rise3 = useRise(12);
  const rise4 = useRise(16);
  const rise5 = useRise(20);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.coal,
        alignItems: "center",
        justifyContent: "center",
        // Shift the block above true center so it survives the 58%-top crop
        // (720x742) with everything visible, like the reference layout.
        padding: "0 44px 230px",
      }}
    >
      {/* Very subtle top-edge vignette on the #0D0D10 page */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(130% 55% at 50% 0%, rgba(255,255,255,0.05), rgba(255,255,255,0) 62%)",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 600,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Repo logo mark: clay pill, mono lowercase name */}
        <div style={{ ...rise0, background: theme.clay, borderRadius: 10, padding: "9px 24px" }}>
          <span
            style={{
              fontFamily: theme.mono,
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: theme.coal,
              textTransform: "lowercase",
            }}
          >
            {name}
          </span>
        </div>
        <div style={{ ...rise0, fontFamily: theme.sans, fontSize: 15, fontWeight: 500, color: theme.dim }}>
          {fullName}
        </div>

        {/* README hairline divider */}
        <div style={{ ...rise1, width: "100%", height: 1, background: "rgba(255,255,255,0.08)" }} />

        <div
          style={{
            ...rise1,
            fontFamily: theme.serif,
            fontStyle: "italic",
            fontSize: 26,
            color: theme.white,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {tagline}
        </div>

        {/* GitHub badge row */}
        <div style={{ ...rise2, display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center" }}>
          <Badge label="stars" value={stars} />
          {version ? <Badge label="release" value={version} color="#7EE787" /> : null}
          {language ? <Badge label="lang" value={language} color={theme.salmon} /> : null}
          {license ? <Badge label="license" value={license} color={LINK_BLUE} /> : null}
        </div>

        {/* Trending medal row */}
        <div style={{ ...rise3, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <MedalPill text="#1 Repository Of The Day" />
          <MedalPill text="Trending This Week" />
        </div>

        {metrics.length ? (
          <div
            style={{
              ...rise4,
              fontFamily: theme.sans,
              fontSize: 16,
              fontWeight: 500,
              color: "#9A9AA5",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {metrics.join(" · ")}
          </div>
        ) : null}

        {/* Faint blue link-row footer, README style */}
        <div
          style={{
            ...rise5,
            opacity: rise5.opacity * 0.75,
            fontFamily: theme.sans,
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(255,255,255,0.35)",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {FOOTER_LINKS.map((l, i) => (
            <React.Fragment key={l}>
              {i > 0 ? <span>·</span> : null}
              <span style={{ color: LINK_BLUE, textDecoration: "underline", textUnderlineOffset: 3 }}>{l}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
