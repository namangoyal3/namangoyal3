import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';

/** Soft radial spotlight used by every "THE Nth <plugin>" title card. */
export const SpotlightBg: React.FC<{white?: boolean}> = ({white = false}) =>
  white ? (
    <AbsoluteFill style={{background: C.white}} />
  ) : (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(120% 62% at 50% 48%, #ffffff 0%, #fbfbfb 34%, #e8e8e8 58%, #b9b8b9 82%, #a8a7a8 100%)',
      }}
    />
  );

/**
 * Pale room wall with a blurred palm-leaf shadow — the backdrop behind every
 * light-toned talking-head shot in the source.
 */
export const LeafWallBg: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg,#e9eff1 0%,#eef1ef 55%,#f2f2ee 100%)'}}>
    <svg width={720} height={1280} viewBox="0 0 720 1280">
      <defs>
        <filter id="leafBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g filter="url(#leafBlur)" opacity={0.5} fill="#b6c4cb">
        {[
          'M 470 -60 C 560 40 610 130 600 250 C 560 160 520 110 448 60 Z',
          'M 300 -70 C 380 20 430 96 420 200 C 384 126 344 86 282 40 Z',
          'M 620 -40 C 700 30 720 120 706 210 C 676 140 646 106 596 62 Z',
          'M 130 -60 C 200 10 236 76 230 160 C 200 100 168 70 118 34 Z',
        ].map((d, i) => (
          <path key={i} d={d} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse
            key={i}
            cx={90 + i * 118}
            cy={40 + (i % 3) * 46}
            rx={54}
            ry={17}
            transform={`rotate(${-38 + i * 14} ${90 + i * 118} ${40 + (i % 3) * 46})`}
          />
        ))}
      </g>
      {/* film grain */}
      <rect width={720} height={1280} fill="url(#grain)" opacity={0.06} />
      <defs>
        <pattern id="grain" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#000" opacity="0.03" />
          <circle cx="1" cy="1" r="0.5" fill="#fff" opacity="0.5" />
        </pattern>
      </defs>
    </svg>
  </AbsoluteFill>
);

/** Out-of-focus desk photo used behind the console-error shot. */
export const BlurredDeskBg: React.FC = () => (
  <AbsoluteFill style={{background: '#c9c3bb'}}>
    <svg width={720} height={1280} viewBox="0 0 720 1280">
      <defs>
        <filter id="deskBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="34" />
        </filter>
        <linearGradient id="deskTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8d4cd" />
          <stop offset="42%" stopColor="#9d968d" />
          <stop offset="52%" stopColor="#141210" />
          <stop offset="72%" stopColor="#0b0a09" />
          <stop offset="100%" stopColor="#cfc9c1" />
        </linearGradient>
      </defs>
      <rect width={720} height={1280} fill="url(#deskTop)" />
      <g filter="url(#deskBlur)" opacity={0.85}>
        <ellipse cx={520} cy={1180} rx={120} ry={70} fill="#c96a3c" />
        <ellipse cx={180} cy={1215} rx={150} ry={64} fill="#b9b0a4" />
        <rect x={60} y={1075} width={600} height={60} rx={30} fill="#ddd6cc" />
      </g>
    </svg>
  </AbsoluteFill>
);

/** Flat near-black used by the Supabase / Strix / Context7 b-roll shots. */
export const DarkBg: React.FC<{color?: string}> = ({color = C.black}) => (
  <AbsoluteFill style={{background: color}} />
);
