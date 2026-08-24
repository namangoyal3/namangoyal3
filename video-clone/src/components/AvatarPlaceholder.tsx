import React from 'react';
import {useCurrentFrame} from 'remotion';
import {F} from '../theme';

/**
 * Stand-in for the presenter footage.
 *
 * Deliberately *not* a character: no face, no hair, no expression. It is a
 * featureless bust on a defocused studio wall, the way a video tool renders an
 * absent participant — so it reads as "footage goes here" rather than as a
 * cartoon person sharing the frame with real UI.
 *
 * What it does reproduce is the source's geometry, measured off the frames:
 *   camera card   full width, top y=804, 100px top radius
 *   head          ~322px wide, crown at y≈663 — i.e. overlapping the card lip
 *   close-ups     ~575px wide, crown at y≈90
 * and the slow positional drift of a person talking (the source's head wanders
 * roughly ±15px horizontally over a few seconds; nothing snappier than that).
 */

type Tone = 'light' | 'dark';

const ROOM: Record<Tone, {wall: [string, string]; figure: [string, string]}> = {
  light: {wall: ['#eaeeed', '#cbd5d3'], figure: ['#9aa4ac', '#79838c']},
  dark: {wall: ['#2a3037', '#171b20'], figure: ['#5a636e', '#3d454e']},
};

/** Featureless head-and-shoulders bust. Units are ~290 wide at scale 1. */
const Bust: React.FC<{
  frame: number;
  scale: number;
  cx: number;
  cy: number;
  tone: Tone;
  id: string;
  /** Mic position in bust units — the two source framings differ. */
  micY: number;
}> = ({frame, scale, cx, cy, tone, id, micY}) => {
  // Slow drift only — matched to how far the source's head actually wanders.
  const driftX = Math.sin(frame / 47) * 9 + Math.sin(frame / 113) * 5;
  const driftY = Math.sin(frame / 61) * 4;
  const [a, b] = ROOM[tone].figure;

  return (
    <g transform={`translate(${cx + driftX} ${cy + driftY}) scale(${scale})`}>
      <defs>
        <linearGradient id={`fig-${id}`} x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
        <filter id={`soft-${id}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      <g fill={`url(#fig-${id})`} filter={`url(#soft-${id})`}>
        {/* shoulders */}
        <path d="M -272 470 C -272 250 -150 158 0 158 C 150 158 272 250 272 470 Z" />
        {/* neck */}
        <path d="M -62 40 C -62 132 -46 168 0 168 C 46 168 62 132 62 40 Z" />
        {/* head */}
        <ellipse cx={0} cy={-78} rx={145} ry={172} />
      </g>

      {/* a single soft highlight so the bust reads as a volume, not a sticker */}
      <ellipse
        cx={-46}
        cy={-118}
        rx={72}
        ry={92}
        fill="#ffffff"
        opacity={tone === 'dark' ? 0.05 : 0.09}
        filter={`url(#soft-${id})`}
      />

      {/* the microphone that sits in the source's framing */}
      <g opacity={0.92} transform={`translate(0 ${micY})`}>
        <ellipse cx={0} cy={0} rx={46} ry={60} fill={tone === 'dark' ? '#16191d' : '#22262b'} />
        <rect x={-11} y={48} width={22} height={150} rx={7} fill={tone === 'dark' ? '#1d2126' : '#2b3036'} />
      </g>
    </g>
  );
};

/** Defocused studio wall behind the bust. */
const Wall: React.FC<{tone: Tone; id: string}> = ({tone, id}) => {
  const [a, b] = ROOM[tone].wall;
  return (
    <>
      <defs>
        <linearGradient id={`wall-${id}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
        <radialGradient id={`pool-${id}`} cx="0.34" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={tone === 'dark' ? 0.1 : 0.5} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={720} height={1280} fill={`url(#wall-${id})`} />
      <rect width={720} height={1280} fill={`url(#pool-${id})`} />
    </>
  );
};

/** Talking-head card + bust. The card is drawn first so the head overlaps it. */
export const TalkingHead: React.FC<{
  cardTop?: number;
  tone?: Tone;
  /** How far the crown of the head rises above the card lip. */
  overhang?: number;
  scale?: number;
}> = ({cardTop = 804, tone = 'light', overhang = 137, scale = 1.11}) => {
  const frame = useCurrentFrame();
  return (
    <>
      <svg
        width={720}
        height={1280}
        viewBox="0 0 720 1280"
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <clipPath id="cardShape">
            <rect x={0} y={cardTop} width={720} height={1280 - cardTop} rx={100} ry={100} />
          </clipPath>
        </defs>
        <g clipPath="url(#cardShape)">
          <Wall tone={tone} id="card" />
        </g>
        {/* the bust is unclipped, so the head breaks the card's top edge */}
        <Bust
          frame={frame}
          scale={scale}
          cx={402}
          cy={cardTop + overhang}
          tone={tone}
          id="card"
          micY={242}
        />
      </svg>
      <PlaceholderTag tone={tone} />
    </>
  );
};

/** Full-bleed close-up variant used by the two outro shots. */
export const CloseUpHead: React.FC<{tone?: Tone; scale?: number}> = ({
  tone = 'light',
  scale = 1.9,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <svg width={720} height={1280} viewBox="0 0 720 1280">
        <Wall tone={tone} id="closeup" />
        <Bust frame={frame} scale={scale} cx={360} cy={580} tone={tone} id="closeup" micY={300} />
      </svg>
      <PlaceholderTag tone={tone} />
    </div>
  );
};

const PlaceholderTag: React.FC<{tone: Tone}> = ({tone}) => (
  <div
    style={{
      position: 'absolute',
      bottom: 26,
      left: 0,
      width: '100%',
      textAlign: 'center',
      fontFamily: F.mono,
      fontSize: 12,
      letterSpacing: '0.34em',
      color: tone === 'dark' ? 'rgba(255,255,255,0.26)' : 'rgba(20,24,28,0.24)',
      textTransform: 'uppercase',
    }}
  >
    avatar placeholder
  </div>
);
