import React from 'react';
import {C} from '../theme';

/** The orange pixel crab that stands in for the Claude Code mascot. */
export const PixelCrab: React.FC<{size?: number; color?: string}> = ({
  size = 64,
  color = C.claudeOrange,
}) => {
  // 11x8 pixel grid, transcribed from the source's mascot.
  const rows = [
    '00011111000',
    '00111111100',
    '01111111110',
    '11111111111',
    '11011111011',
    '11111111111',
    '01110001110',
    '11000000011',
  ];
  const u = size / 11;
  return (
    <svg width={size} height={u * 8} viewBox={`0 0 11 8`} shapeRendering="crispEdges">
      {rows.map((row, y) =>
        row.split('').map((v, x) =>
          v === '1' ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={y === 4 && (x === 2 || x === 8) ? '#1b1a18' : color}
            />
          ) : null
        )
      )}
    </svg>
  );
};

/** Two stacked document sheets with a `</>` glyph — the installer's app icon. */
export const CodeDocsIcon: React.FC<{size?: number}> = ({size = 150}) => (
  <svg width={size} height={size * 1.11} viewBox="0 0 120 120" preserveAspectRatio="none">
    <g stroke={C.installerInk} strokeWidth={5} strokeLinejoin="round" fill="#f6f1e6">
      <path d="M 40 12 h 40 l 22 22 v 62 h -62 Z" />
      <path d="M 18 26 h 40 l 22 22 v 62 h -62 Z" />
      <path d="M 58 26 v 22 h 22" fill="none" />
    </g>
    <g
      stroke={C.installerInk}
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <path d="M 40 68 l -10 10 l 10 10" />
      <path d="M 58 68 l 10 10 l -10 10" />
      <path d="M 52 92 l 6 -28" />
    </g>
  </svg>
);

export const Squircle: React.FC<{
  size: number;
  fill: string;
  children?: React.ReactNode;
  shadow?: boolean;
}> = ({size, fill, children, shadow = true}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.235,
      background: fill,
      boxShadow: shadow ? '0 26px 60px rgba(0,0,0,0.22), 0 6px 16px rgba(0,0,0,0.12)' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

/** Playwright's theatre masks. */
export const PlaywrightMasks: React.FC<{size?: number}> = ({size = 210}) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 280 202">
    <g transform="rotate(-6 96 100)">
      <path
        d="M 22 24 C 66 8 128 8 170 24 C 172 94 150 176 96 190 C 42 176 20 94 22 24 Z"
        fill="#e0524a"
        stroke="#1e2a3a"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <ellipse cx={64} cy={78} rx={11} ry={13} fill="#1e2a3a" />
      <ellipse cx={126} cy={78} rx={11} ry={13} fill="#1e2a3a" />
      <path
        d="M 62 140 C 80 120 112 120 130 140"
        stroke="#1e2a3a"
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />
    </g>
    <g transform="rotate(7 184 100)">
      <path
        d="M 110 24 C 154 8 216 8 258 24 C 260 94 238 176 184 190 C 130 176 108 94 110 24 Z"
        fill="#2fa04a"
        stroke="#1e2a3a"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M 138 84 C 148 68 168 68 178 84" stroke="#1e2a3a" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M 194 84 C 204 68 224 68 234 84" stroke="#1e2a3a" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M 142 128 C 168 166 202 166 226 128 Z" fill="#1e2a3a" />
    </g>
  </svg>
);

export const SupabaseMark: React.FC<{size?: number}> = ({size = 46}) => (
  <svg width={size} height={size} viewBox="0 0 40 44">
    <path d="M 22 0 L 4 24 h 14 l -2 20 L 36 20 H 22 Z" fill={C.supabaseGreen} />
  </svg>
);

/** Strix's pixel "S" glyph. */
export const StrixMark: React.FC<{size?: number; height?: number; color?: string}> = ({
  size = 150,
  height,
  color = '#ffffff',
}) => {
  const rows = [
    '0011100',
    '0111110',
    '1111000',
    '0111110',
    '0001111',
    '0111110',
    '0011100',
  ];
  return (
    <svg width={size} height={height ?? size} viewBox="0 0 7 7" preserveAspectRatio="none" shapeRendering="crispEdges">
      {rows.map((row, y) =>
        row.split('').map((v, x) =>
          v === '1' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
          ) : null
        )
      )}
    </svg>
  );
};

/** Context7's paired brace mark. */
export const Context7Mark: React.FC<{size?: number}> = ({size = 190}) => {
  // A straight-segment brace, drawn once and mirrored. The points face outward,
  // so the channel between the two glyphs widens at mid-height as in the source.
  const brace =
    'M 78 0 H 40 V 58 L 0 75 L 40 92 V 150 H 78 V 124 H 66 V 88 L 26 75 L 66 62 V 26 H 78 Z';
  return (
    <svg width={size} height={size * 1.19} viewBox="0 0 200 150" preserveAspectRatio="none">
      <g fill="#ffffff">
        <path d={brace} />
        <g transform="translate(200 0) scale(-1 1)">
          <path d={brace} />
        </g>
      </g>
    </svg>
  );
};

/** SkillUI's blocky wordmark — salmon letters with a per-letter tint shift. */
export const SkillUiMark: React.FC<{size?: number}> = ({size = 200}) => {
  const letters = 'SKILLUI'.split('');
  const tints = ['#f0937c', '#f4a894', '#f7bdac', '#f4a894', '#ef8f76', '#f4a894', '#f7bdac'];
  return (
    <svg width={size} height={size * 0.3} viewBox="0 0 200 60">
      {letters.map((ch, i) => (
        <text
          key={i}
          x={12 + i * 26.5}
          y={44}
          fontFamily='"JetBrains Mono", monospace'
          fontWeight={700}
          fontSize={40}
          fill={tints[i]}
        >
          {ch}
        </text>
      ))}
    </svg>
  );
};

/** OpenAI Codex's rounded knot mark. */
export const CodexMark: React.FC<{size?: number}> = ({size = 34}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path
      d="M 8 14 C 14 6 26 6 32 14 C 26 12 22 16 20 20 C 18 24 14 28 8 26 Z"
      fill="#ffffff"
    />
    <path
      d="M 32 26 C 26 34 14 34 8 26 C 14 28 18 24 20 20 C 22 16 26 12 32 14 Z"
      fill="#ffffff"
      opacity={0.75}
    />
  </svg>
);
