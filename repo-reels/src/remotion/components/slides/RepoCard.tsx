import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import { PixelMascot, Pill, useRise } from "./shared";

// ---------------------------------------------------------------------------
// 2. Repo showcase card — dark GitHub-README style
// ---------------------------------------------------------------------------

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
