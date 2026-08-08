import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { Timeline, TimelineSegment } from "../types";
import { theme } from "./theme";
import { Presenter, PresenterCard } from "./components/Presenter";
import { Karaoke } from "./components/Karaoke";
import { Slide } from "./components/Slide";
import { sampleTimeline } from "./sample";

export const defaultTimeline = sampleTimeline;

export const RepoReel: React.FC<Timeline> = (timeline) => {
  const { fps } = useVideoConfig();
  const segments = timeline.segments ?? [];

  return (
    <AbsoluteFill style={{ backgroundColor: theme.cream }}>
      {/* Persistent presenter layer: HeyGen video (with audio) or placeholder.
          Slides render on top of it, exactly like the reference edit. */}
      <Presenter timeline={timeline} />

      {segments.map((seg) => {
        const from = Math.round(seg.start * fps);
        const dur = Math.max(1, Math.round((seg.end - seg.start) * fps));
        return (
          <Sequence key={seg.id} from={from} durationInFrames={dur} name={`${seg.shot}:${seg.slide?.kind ?? seg.avatarCrop ?? ""}`}>
            {seg.shot === "slide" && seg.slide ? (
              <>
                <SlideArea seg={seg} />
                {seg.avatarBelow ? <PresenterCard timeline={timeline} /> : null}
              </>
            ) : null}
            {/* The CTA slide is its own caption lockup — no karaoke on top */}
            {seg.slide?.kind === "cta" ? null : <Karaoke seg={seg} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SlideArea: React.FC<{ seg: TimelineSegment }> = ({ seg }) => {
  const split = Boolean(seg.avatarBelow);
  return (
    <AbsoluteFill
      style={{
        height: split ? "58%" : "100%",
        bottom: "auto",
        overflow: "hidden",
        borderBottomLeftRadius: split ? 28 : 0,
        borderBottomRightRadius: split ? 28 : 0,
      }}
    >
      <Slide spec={seg.slide!} />
    </AbsoluteFill>
  );
};
