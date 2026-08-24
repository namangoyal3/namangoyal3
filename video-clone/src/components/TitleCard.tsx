import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {SpotlightBg} from './Backdrops';

/**
 * "THE FIRST / <PLUGIN>" reveal card.
 *
 * Beat order, taken from the source: the ordinal lands first in salmon, the app
 * icon springs in over its lower half, then the plugin name slides up in grey
 * underneath. The five cards do not share one lockup — the source shifts the
 * Playwright card ~60px higher than the rest — so the vertical anchors are
 * per-card and measured off the frames.
 */
export const TitleCard: React.FC<{
  ordinal: string;
  name: string;
  icon: (size: number) => React.ReactNode;
  /** Top of the salmon ordinal. */
  ordinalTop: number;
  /** Top of the app icon. */
  iconTop: number;
  /** Edge length of the squircle. */
  iconSize: number;
  /** The fifth card drops the vignette for a flat white field. */
  white?: boolean;
}> = ({ordinal, name, icon, ordinalTop, iconTop, iconSize, white = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const ordIn = spring({frame, fps, config: {damping: 14, mass: 0.5}});
  const iconIn = spring({frame: frame - 2, fps, config: {damping: 12, mass: 0.4}});
  const nameIn = spring({frame: frame - 12, fps, config: {damping: 15, mass: 0.6}});

  return (
    <AbsoluteFill>
      <SpotlightBg white={white} />

      {/* ordinal — the icon lands over its lower half */}
      <div
        style={{
          position: 'absolute',
          top: ordinalTop - 10,
          left: 0,
          width: '100%',
          textAlign: 'center',
          fontFamily: F.serif,
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: 58,
          letterSpacing: '0.01em',
          color: C.salmon,
          textShadow: '0 6px 18px rgba(219,140,120,0.35)',
          transform: `scale(${interpolate(ordIn, [0, 1], [1.35, 1])})`,
          opacity: ordIn,
        }}
      >
        {ordinal}
      </div>

      {/* plugin name — drawn before the icon so the icon overlaps its top */}
      <div
        style={{
          position: 'absolute',
          top: 742,
          left: 0,
          width: '100%',
          textAlign: 'center',
          fontFamily: F.serif,
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: 56,
          color: '#b6b6b8',
          textShadow: '0 10px 22px rgba(0,0,0,0.34), 0 2px 0 rgba(255,255,255,0.5)',
          transform: `translateY(${interpolate(nameIn, [0, 1], [46, 0])}px)`,
          opacity: nameIn,
        }}
      >
        {name}
      </div>

      {/* app icon */}
      <div
        style={{
          position: 'absolute',
          top: iconTop,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${interpolate(iconIn, [0, 1], [0.55, 1])})`,
          transformOrigin: `50% ${iconSize / 2}px`,
          opacity: interpolate(frame, [0, 4], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        {icon(iconSize)}
      </div>
    </AbsoluteFill>
  );
};
