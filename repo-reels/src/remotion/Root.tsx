import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { RepoReel, defaultTimeline } from "./RepoReel";
import type { Timeline } from "../types";

export const Root: React.FC = () => {
  return (
    <Composition
      id="RepoReel"
      component={RepoReel as unknown as React.ComponentType<Record<string, unknown>>}
      width={720}
      height={1280}
      fps={30}
      durationInFrames={defaultTimeline.durationInFrames}
      defaultProps={defaultTimeline as unknown as Record<string, unknown>}
      calculateMetadata={({ props }) => {
        const t = props as unknown as Timeline;
        return {
          durationInFrames: t.durationInFrames,
          fps: t.fps,
          width: t.width,
          height: t.height,
        };
      }}
    />
  );
};
