import React from 'react';
import {useCurrentFrame} from 'remotion';
import {F} from '../theme';

/**
 * Stand-in for the presenter footage.
 *
 * The source is a talking-head shot whose subject is cut out and allowed to
 * overlap the top lip of a rounded camera card (card top y=804, corner radius
 * 100px, full frame width). That geometry is reproduced exactly; only the
 * person is replaced by a neutral figure.
 */

type Tone = 'light' | 'dark';

const ROOM: Record<Tone, [string, string]> = {
  light: ['#eef2f0', '#c9d4d1'],
  dark: ['#2b3138', '#171b20'],
};

const Figure: React.FC<{
  frame: number;
  scale: number;
  cx: number;
  cy: number;
}> = ({frame, scale, cx, cy}) => {
  // Idle motion so the placeholder does not read as a frozen still.
  const breathe = Math.sin(frame / 17) * 4;
  const sway = Math.sin(frame / 29) * 5;
  const tilt = Math.sin(frame / 41) * 1.2;
  const mouth = 9 + Math.abs(Math.sin(frame / 3.1)) * 15;

  return (
    <g
      transform={`translate(${cx + sway} ${cy + breathe}) rotate(${tilt}) scale(${scale})`}
    >
      {/* torso */}
      <path
        d="M -268 430 C -268 232 -146 146 0 146 C 146 146 268 232 268 430 Z"
        fill="#8d9585"
      />
      {/* collar opening */}
      <path d="M -92 150 C -58 196 58 196 92 150 L 92 120 L -92 120 Z" fill="#e3bfa4" />
      {/* neck */}
      <rect x={-54} y={10} width={108} height={140} rx={42} fill="#dcb397" />
      {/* head */}
      <ellipse cx={0} cy={-64} rx={134} ry={160} fill="#eecdb2" />
      {/* ears */}
      <ellipse cx={-132} cy={-46} rx={18} ry={26} fill="#e6c3a8" />
      <ellipse cx={132} cy={-46} rx={18} ry={26} fill="#e6c3a8" />
      {/* hair */}
      <path
        d="M -138 -58 C -150 -96 -152 -172 -108 -212 C -74 -244 -20 -256 6 -254
           C 74 -250 146 -212 140 -120 C 138 -88 134 -70 130 -52
           C 124 -104 112 -136 84 -152 C 40 -178 -50 -178 -94 -150
           C -120 -134 -132 -102 -138 -58 Z"
        fill="#2e2620"
      />
      {/* a few curls breaking the silhouette */}
      <g fill="#2e2620">
        <circle cx={-118} cy={-176} r={26} />
        <circle cx={-62} cy={-216} r={30} />
        <circle cx={4} cy={-232} r={32} />
        <circle cx={70} cy={-214} r={30} />
        <circle cx={120} cy={-172} r={26} />
      </g>
      {/* eyes + brows */}
      <ellipse cx={-49} cy={-74} rx={13} ry={9} fill="#2e2620" />
      <ellipse cx={49} cy={-74} rx={13} ry={9} fill="#2e2620" />
      <rect x={-68} y={-112} width={40} height={7} rx={3.5} fill="#2e2620" />
      <rect x={28} y={-112} width={40} height={7} rx={3.5} fill="#2e2620" />
      {/* nose */}
      <path d="M 0 -58 L -10 -14 L 8 -14" fill="none" stroke="#d3a488" strokeWidth={5} strokeLinecap="round" />
      {/* mouth */}
      <ellipse cx={0} cy={22} rx={30} ry={mouth} fill="#8f4a44" />
      {/* microphone */}
      <g transform="translate(0 372)">
        <ellipse cx={0} cy={0} rx={44} ry={58} fill="#131313" />
        <rect x={-11} y={50} width={22} height={120} rx={7} fill="#1d1d1d" />
      </g>
    </g>
  );
};

/** Talking-head card + figure. Renders the card first so the head overlaps it. */
export const TalkingHead: React.FC<{
  cardTop?: number;
  tone?: Tone;
  /** How far the head rises above the card lip. */
  overhang?: number;
  scale?: number;
}> = ({cardTop = 804, tone = 'light', overhang = 151, scale = 1.105}) => {
  const frame = useCurrentFrame();
  const [a, b] = ROOM[tone];
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: cardTop,
          width: 720,
          height: 1280 - cardTop,
          borderRadius: '100px 100px 0 0',
          background: `linear-gradient(165deg, ${a} 0%, ${b} 100%)`,
        }}
      />
      <svg
        width={720}
        height={1280}
        viewBox="0 0 720 1280"
        style={{position: 'absolute', inset: 0}}
      >
        <Figure frame={frame} scale={scale} cx={402} cy={cardTop + overhang} />
      </svg>
      <PlaceholderTag top={1280 - 40} tone={tone} />
    </>
  );
};

/** Full-bleed close-up variant used by the two outro shots. */
export const CloseUpHead: React.FC<{tone?: Tone; scale?: number}> = ({
  tone = 'light',
  scale = 1.97,
}) => {
  const frame = useCurrentFrame();
  const [a, b] = ROOM[tone];
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${a}, ${b})`,
      }}
    >
      <svg width={720} height={1280} viewBox="0 0 720 1280">
        <Figure frame={frame} scale={scale} cx={360} cy={604} />
      </svg>
      <PlaceholderTag top={1280 - 40} tone={tone} />
    </div>
  );
};

const PlaceholderTag: React.FC<{top: number; tone: Tone}> = ({top, tone}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: 0,
      width: '100%',
      textAlign: 'center',
      fontFamily: F.mono,
      fontSize: 13,
      letterSpacing: '0.3em',
      color: tone === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(20,20,20,0.28)',
      textTransform: 'uppercase',
    }}
  >
    avatar placeholder
  </div>
);
