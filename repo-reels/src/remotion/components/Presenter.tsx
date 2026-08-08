import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Timeline } from "../../types";
import { theme } from "../theme";

function activeSegment(timeline: Timeline, tSec: number) {
  return timeline.segments.find((s) => tSec >= s.start && tSec < s.end) ?? timeline.segments[timeline.segments.length - 1];
}

/**
 * Persistent bottom layer: the talking head runs (with its audio) for the
 * whole reel; slides are overlaid on top. Crop level switches per segment to
 * reproduce the reference's medium/close cut rhythm.
 */
export const Presenter: React.FC<{ timeline: Timeline }> = ({ timeline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seg = activeSegment(timeline, frame / fps);
  const close = seg?.shot === "avatar" && seg.avatarCrop === "close";
  const scale = close ? 1.35 : 1.0;
  // HeyGen frames put the face around 38% height; the placeholder figure sits lower.
  const zoomOrigin = timeline.avatarSrc ? "50% 38%" : "50% 74%";

  if (timeline.avatarSrc) {
    return (
      <AbsoluteFill style={{ backgroundColor: theme.paper }}>
        <OffthreadVideo
          src={staticFile(timeline.avatarSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})`, transformOrigin: zoomOrigin }}
        />
      </AbsoluteFill>
    );
  }
  return <PlaceholderPresenter scale={scale} />;
};

/** Rounded card showing the presenter at the bottom of split (slide-over) shots. */
export const PresenterCard: React.FC<{ timeline: Timeline }> = ({ timeline }) => {
  return (
    <AbsoluteFill style={{ top: "58%", height: "42%", bottom: "auto", backgroundColor: theme.creamDeep }}>
      <div
        style={{
          position: "absolute",
          inset: "12px 16px 0 16px",
          borderRadius: 26,
          overflow: "hidden",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
        }}
      >
        {timeline.avatarSrc ? (
          <OffthreadVideo
            src={staticFile(timeline.avatarSrc)}
            muted
            style={{ width: "100%", height: "238%", objectFit: "cover", objectPosition: "50% 18%" }}
          />
        ) : (
          <PlaceholderPresenter scale={1} inCard />
        )}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Stand-in presenter for mock mode / before the HeyGen key is configured:
 * soft studio backdrop + abstract head-and-shoulders silhouette + voice rings.
 */
const PlaceholderPresenter: React.FC<{ scale: number; inCard?: boolean }> = ({ scale, inCard }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.04 * Math.sin(frame / 3.2);
  const ring = (i: number) => 0.35 - 0.11 * i + 0.08 * Math.sin(frame / 4 + i);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% 18%, #fdfcf9 0%, ${theme.paper} 45%, #e3ded2 100%)`,
        alignItems: "center",
        justifyContent: inCard ? "center" : "flex-end",
        transform: `scale(${scale})`,
        transformOrigin: "50% 74%",
      }}
    >
      <div style={{ position: "relative", width: 420, height: inCard ? 340 : 560, marginBottom: inCard ? 0 : -60 }}>
        {/* voice rings */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: 130,
              width: 260 + i * 90,
              height: 260 + i * 90,
              transform: `translateX(-50%) scale(${pulse})`,
              borderRadius: "50%",
              border: `2px solid rgba(222,107,72,${Math.max(0, ring(i))})`,
            }}
          />
        ))}
        {/* head */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 60,
            transform: "translateX(-50%)",
            width: 190,
            height: 210,
            borderRadius: "48% 48% 44% 44%",
            background: `linear-gradient(180deg, #3c3a38 0%, ${theme.ink} 90%)`,
          }}
        />
        {/* shoulders */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 250,
            transform: "translateX(-50%)",
            width: 400,
            height: 320,
            borderRadius: "50% 50% 0 0",
            background: `linear-gradient(180deg, #2c2a29 0%, #1b1a19 100%)`,
          }}
        />
        {/* collar accent */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 258,
            transform: "translateX(-50%)",
            width: 120,
            height: 44,
            borderRadius: "0 0 60px 60px",
            background: theme.paper,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
