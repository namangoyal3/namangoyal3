import React from "react";
import { AbsoluteFill } from "remotion";
import type { SlideSpec } from "../../types";
import { theme } from "../theme";
import { Kinetic } from "./slides/Kinetic";
import { RepoCard } from "./slides/RepoCard";
import { StarHistory } from "./slides/StarHistory";
import { StatBars } from "./slides/StatBars";
import { Installer } from "./slides/Installer";
import { FileTree } from "./slides/FileTree";
import { Graph } from "./slides/Graph";
import { Terminal } from "./slides/Terminal";
import { Cta } from "./slides/Cta";

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
