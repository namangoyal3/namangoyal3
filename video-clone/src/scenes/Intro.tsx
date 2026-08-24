import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {TalkingHead} from '../components/AvatarPlaceholder';
import {CodeBody, Window} from '../components/Chrome';
import {CodexMark, PixelCrab} from '../components/Icons';

/**
 * Scene 1 (f0–54). White field, a Claude / Codex head-to-head, and two code
 * panes that spring in and then type themselves out.
 */

const CLAUDE_CODE = [
  {t: 'function App() {', c: '#cf8f6a'},
  {t: '  return (', c: '#8fb8d8'},
  {t: '    <div className="app">', c: '#7fb08a'},
  {t: '      <Hero />', c: '#c9d5e2'},
];

const CODEX_CODE = [
  {t: 'def greet(name):', c: '#8fb8d8'},
  {t: '    return f"Hello, {name}!"', c: '#cf8f6a'},
  {t: '', c: '#c9d5e2'},
  {t: 'print(greet("world"))', c: '#7fb08a'},
];

const Pane: React.FC<{
  left: number;
  lines: {t: string; c?: string}[];
  label: string;
  delay: number;
}> = ({left, lines, label, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - delay, fps, config: {damping: 14, mass: 0.5}});

  // Reveal one line roughly every 7 frames, then a character caret.
  const shown = Math.max(0, Math.floor((frame - delay - 4) / 7));
  const visible = lines.slice(0, Math.min(shown, lines.length));

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: 341,
        transform: `scale(${interpolate(enter, [0, 1], [0.7, 1])})`,
        opacity: enter,
      }}
    >
      <Window width={285} height={156} radius={12} bar="none">
        <div style={{padding: '9px 10px', display: 'flex', gap: 4}}>
          {['#4b525c', '#4b525c', '#4b525c'].map((c, i) => (
            <span key={i} style={{width: 5, height: 5, borderRadius: 3, background: c}} />
          ))}
          <span
            style={{
              marginLeft: 8,
              fontFamily: F.mono,
              fontSize: 8,
              color: '#5c6672',
            }}
          >
            {label}
          </span>
        </div>
        <CodeBody
          lines={visible}
          fontSize={9}
          padding={0}
          caretLine={visible.length - 1}
        />
      </Window>
    </div>
  );
};

const Badge: React.FC<{
  left: number;
  label: string;
  tint: string;
  children: React.ReactNode;
}> = ({left, label, tint, children}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top: 268,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }}
  >
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: 15,
        background: tint,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(0,0,0,0.09)',
      }}
    >
      {children}
    </div>
    <span
      style={{
        fontFamily: F.sans,
        fontWeight: 700,
        fontSize: 25,
        color: C.ink,
        letterSpacing: '-0.02em',
      }}
    >
      {label}
    </span>
  </div>
);

export const Intro: React.FC = () => (
  <AbsoluteFill style={{background: C.white}}>
    <div
      style={{
        position: 'absolute',
        top: 240,
        left: 0,
        width: '100%',
        textAlign: 'center',
        fontFamily: F.mono,
        fontSize: 9,
        letterSpacing: '0.32em',
        color: '#a9a49c',
      }}
    >
      • VIBE CODING — LIVE
    </div>

    <Badge left={132} label="Claude" tint="#f6ede7">
      <PixelCrab size={30} />
    </Badge>
    <Badge left={439} label="Codex" tint="#e5ecfb">
      <CodexMark size={26} />
    </Badge>

    <Pane left={62} lines={CLAUDE_CODE} label="app.tsx" delay={12} />
    <Pane left={370} lines={CODEX_CODE} label="main.py" delay={14} />

    <TalkingHead cardTop={804} tone="light" />
  </AbsoluteFill>
);
