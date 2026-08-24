import React from 'react';
import {C, F} from '../theme';

/** Rounded window shell shared by every screen-recording mockup. */
export const Window: React.FC<{
  width: number;
  height: number;
  dark?: boolean;
  radius?: number;
  bar?: 'mac' | 'browser' | 'none';
  url?: string;
  accentBorder?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  width,
  height,
  dark = true,
  radius = 16,
  bar = 'mac',
  url,
  accentBorder,
  style,
  children,
}) => {
  const barH = bar === 'none' ? 0 : bar === 'browser' ? 34 : 26;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: dark ? '#0f141b' : '#ffffff',
        boxShadow: '0 30px 70px rgba(0,0,0,0.38), 0 4px 12px rgba(0,0,0,0.22)',
        border: accentBorder ? `3px solid ${accentBorder}` : 'none',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {bar !== 'none' && (
        <div
          style={{
            height: barH,
            background: dark ? '#1b2029' : '#eceae6',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            gap: 6,
            borderBottom: `1px solid ${dark ? '#232a34' : '#dedad3'}`,
          }}
        >
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span
              key={c}
              style={{width: 8, height: 8, borderRadius: 4, background: c}}
            />
          ))}
          {url && (
            <div
              style={{
                marginLeft: 14,
                flex: 1,
                height: 18,
                borderRadius: 9,
                background: dark ? '#0d1117' : '#f7f5f1',
                color: dark ? '#7d8894' : '#8a857c',
                fontFamily: F.mono,
                fontSize: 9,
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
              }}
            >
              {url}
            </div>
          )}
        </div>
      )}
      <div style={{position: 'relative', height: height - barH}}>{children}</div>
    </div>
  );
};

/** Monospace code body with syntax-ish colouring and an optional caret. */
export const CodeBody: React.FC<{
  lines: {t: string; c?: string}[];
  fontSize?: number;
  gutter?: boolean;
  caretLine?: number;
  caretCol?: number;
  padding?: number;
}> = ({lines, fontSize = 11, gutter = false, caretLine, caretCol, padding = 14}) => (
  <div
    style={{
      padding,
      fontFamily: F.mono,
      fontSize,
      lineHeight: 1.62,
      color: '#c9d5e2',
      whiteSpace: 'pre',
    }}
  >
    {lines.map((l, i) => (
      <div key={i} style={{display: 'flex'}}>
        {gutter && (
          <span style={{color: '#3d4854', width: 22, flexShrink: 0}}>{i + 1}</span>
        )}
        <span style={{color: l.c ?? '#c9d5e2'}}>
          {l.t}
          {caretLine === i && (
            <span
              style={{
                display: 'inline-block',
                width: fontSize * 0.6,
                height: fontSize * 1.1,
                background: '#c9d5e2',
                verticalAlign: 'text-bottom',
                marginLeft: caretCol ? 0 : 1,
              }}
            />
          )}
        </span>
      </div>
    ))}
  </div>
);

/** Big black arrow cursor used in the Playwright illustration. */
export const Cursor: React.FC<{size?: number; style?: React.CSSProperties}> = ({
  size = 56,
  style,
}) => (
  <svg width={size} height={size * 1.35} viewBox="0 0 40 54" style={style}>
    <path
      d="M 4 2 L 4 44 L 15 34 L 22 50 L 30 46 L 23 31 L 37 30 Z"
      fill="#141414"
      stroke="#141414"
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <path d="M 8 10 L 8 36 L 15 30 L 21 42 L 24 40 L 18 28 L 28 27 Z" fill="#ffffff" />
  </svg>
);

/** A terminal-styled block used by the SkillUI scenes. */
export const Terminal: React.FC<{
  width: number;
  height: number;
  border?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({width, height, border, children, style}) => (
  <div
    style={{
      width,
      height,
      borderRadius: 10,
      background: '#0b0d10',
      border: border ? `3px solid ${border}` : '1px solid #23272e',
      padding: 12,
      fontFamily: F.mono,
      fontSize: 11,
      lineHeight: 1.55,
      color: '#cfd6dd',
      overflow: 'hidden',
      whiteSpace: 'pre',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{children: React.ReactNode; color?: string}> = ({
  children,
  color = C.claudeOrange,
}) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 7px',
      borderRadius: 4,
      background: color,
      color: '#fff',
      fontFamily: F.sans,
      fontSize: 9,
      fontWeight: 600,
    }}
  >
    {children}
  </span>
);
