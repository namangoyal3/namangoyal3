import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {TalkingHead} from '../components/AvatarPlaceholder';
import {DarkBg} from '../components/Backdrops';
import {StrixMark} from '../components/Icons';

/**
 * Scene 11 (f588–666). Strix's scanner ring spins above a mock startup page.
 * Ring and page go from white to red as the "breach" lands, then the page is
 * stamped BREACHED and the shot ends on a red warning card.
 */
export const StrixAttack: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // f588 + 47 = f635 is where the source flips to full red.
  const red = interpolate(frame, [30, 44], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const markColor = red > 0.5 ? C.hackRed : '#ffffff';
  const spin = frame * 3.2;

  const scanY = interpolate(frame, [8, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const breached = spring({frame: frame - 44, fps, config: {damping: 12, mass: 0.5}});
  const warn = interpolate(frame, [62, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <DarkBg />

      {/* scanner ring */}
      <svg width={720} height={300} viewBox="0 0 720 300" style={{position: 'absolute', top: 100, left: 0}}>
        <g transform={`rotate(${spin} 360 150)`}>
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={360}
              cy={150}
              r={120 - i * 8}
              fill="none"
              stroke={markColor}
              strokeWidth={2}
              strokeDasharray={`${70 + i * 22} ${190 + i * 10}`}
              opacity={0.85 - i * 0.2}
            />
          ))}
        </g>
        <g transform="translate(360 150)">
          <g transform="translate(-62 -44)">
            <StrixMark size={124} color={markColor} />
          </g>
        </g>
      </svg>

      {/* target page */}
      <div
        style={{
          position: 'absolute',
          left: 132,
          top: 504,
          width: 461,
          height: 200,
          borderRadius: 12,
          background: red > 0.5 ? '#2a0e10' : '#12141c',
          border: `1px solid ${red > 0.5 ? '#5c1a1c' : '#232838'}`,
          overflow: 'hidden',
          opacity: 1 - warn,
        }}
      >
        <div
          style={{
            height: 22,
            background: red > 0.5 ? '#3a1214' : '#181b26',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 10,
            gap: 5,
          }}
        >
          {['#4a4f5e', '#4a4f5e', '#4a4f5e'].map((c, i) => (
            <span key={i} style={{width: 6, height: 6, borderRadius: 3, background: c}} />
          ))}
          <span style={{marginLeft: 12, fontFamily: F.mono, fontSize: 7, color: '#5c6272'}}>
            my-startup.app/dashboard
          </span>
          <span
            style={{
              marginLeft: 'auto',
              marginRight: 10,
              fontFamily: F.mono,
              fontSize: 7,
              color: C.hackRed,
              opacity: red,
            }}
          >
            ⚠ VULNERABILITIES FOUND
          </span>
        </div>

        <div style={{padding: 18, position: 'relative', height: '100%'}}>
          <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 15, color: '#e8ecf5'}}>
            Welcome to my startup 🚀
          </div>
          <div style={{marginTop: 16, fontFamily: F.mono, fontSize: 8, color: '#6a7185'}}>
            const apiKey = "sk_live_9x4mb..."
          </div>
          <div
            style={{
              marginTop: 14,
              width: 64,
              height: 20,
              borderRadius: 5,
              background: '#3b57e0',
              color: '#fff',
              fontFamily: F.sans,
              fontSize: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Sign up
          </div>
          <div
            style={{
              position: 'absolute',
              right: 22,
              top: 10,
              width: 92,
              height: 92,
              borderRadius: 46,
              background: red > 0.5 ? 'rgba(255,59,48,0.22)' : 'rgba(96,86,220,0.35)',
              filter: 'blur(2px)',
            }}
          />

          {/* the scan line sweeping down */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: scanY * 210,
              height: 2,
              background: C.hackRed,
              boxShadow: `0 0 18px ${C.hackRed}`,
              opacity: scanY > 0 && scanY < 1 ? 1 : red,
            }}
          />

          {/* attack vectors */}
          <svg width={600} height={230} viewBox="0 0 600 230" style={{position: 'absolute', left: -18, top: -18, opacity: red}}>
            <path d="M 0 150 L 90 110 L 180 160 L 300 96 L 420 150 L 540 104 L 600 140" stroke={C.hackRed} strokeWidth={1.4} fill="none" opacity={0.6} />
            <path d="M 40 40 L 140 92 L 260 30 L 380 96 L 520 36" stroke={C.hackRed} strokeWidth={1.4} fill="none" opacity={0.45} />
          </svg>

          {/* BREACHED stamp */}
          <div
            style={{
              position: 'absolute',
              left: 200,
              top: 120,
              padding: '6px 16px',
              border: `2px solid ${C.hackRed}`,
              borderRadius: 4,
              color: C.hackRed,
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: '0.06em',
              transform: `rotate(-6deg) scale(${breached})`,
              opacity: breached,
            }}
          >
            BREACHED
          </div>
        </div>
      </div>

      {/* closing warning */}
      <div
        style={{
          position: 'absolute',
          top: 636,
          left: 0,
          width: '100%',
          textAlign: 'center',
          opacity: warn,
        }}
      >
        <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 26, color: '#fff', letterSpacing: '-0.01em'}}>
          YOUR VIBE-CODED
        </div>
        <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 26, color: C.hackRed, letterSpacing: '-0.01em'}}>
          SITE ISN'T SAFE.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Scene 12 (f667–761). Strix's findings view: the same page annotated with
 * red callouts naming each vulnerability, over the talking-head card.
 */
const FINDINGS = [
  {label: 'NO RATE LIMITING', x: 440, y: 46, at: 4},
  {label: 'EXPOSED ADMIN ROUTE', x: 446, y: 160, at: 26},
  {label: 'WEAK PASSWORD POLICY', x: 176, y: 190, at: 40},
  {label: 'HARDCODED API KEY', x: 428, y: 234, at: 54},
];

export const StrixFindings: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <DarkBg />
      <div
        style={{
          position: 'absolute',
          left: 172,
          top: 295,
          width: 376,
          height: 175,
          borderRadius: 10,
          background: '#10131c',
          border: '1px solid #1e2330',
          overflow: 'hidden',
        }}
      >
        <div style={{height: 16, background: '#161a25', display: 'flex', alignItems: 'center', paddingLeft: 8, gap: 4}}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{width: 4, height: 4, borderRadius: 2, background: '#3d4356'}} />
          ))}
          <span style={{marginLeft: 10, fontFamily: F.mono, fontSize: 5, color: '#4d5468'}}>
            MYSTARTUP.APP/RUN
          </span>
        </div>
        <div style={{padding: 12, display: 'flex', gap: 12}}>
          <div style={{flex: 1}}>
            <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 11, color: '#e8ecf5', lineHeight: 1.25}}>
              Automate your
              <br />
              entire workflow.
            </div>
            <div style={{marginTop: 10, width: 44, height: 12, borderRadius: 3, background: '#3b57e0'}} />
            <div style={{marginTop: 16, height: 42, borderRadius: 5, background: '#151926'}} />
          </div>
          <div style={{width: 190}}>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 5, height: 46}}>
              {[14, 20, 12, 26, 18, 32, 22, 28].map((h, i) => (
                <div key={i} style={{width: 12, height: h, background: '#5b63d3', borderRadius: 1}} />
              ))}
            </div>
            <div style={{marginTop: 16, height: 42, borderRadius: 5, background: '#151926'}} />
          </div>
        </div>
      </div>

      {/* the red sweep the source draws across the findings view */}
      <div
        style={{
          position: 'absolute',
          left: 176,
          right: 148,
          top: 372,
          height: 2,
          background: C.hackRed,
          opacity: interpolate(frame, [6, 14], [0, 0.9], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />

      {/* red callouts */}
      <svg width={720} height={520} viewBox="0 0 720 520" style={{position: 'absolute', left: 0, top: 180}}>
        {FINDINGS.map((f) => {
          const t = spring({frame: frame - f.at, fps, config: {damping: 15, mass: 0.5}});
          return (
            <g key={f.label} opacity={t}>
              <line
                x1={f.x < 360 ? f.x + 130 : f.x}
                y1={f.y + 8}
                x2={f.x < 360 ? 200 : 500}
                y2={f.y + 8}
                stroke={C.hackRed}
                strokeWidth={1.4}
              />
              <rect
                x={f.x}
                y={f.y}
                width={f.label.length * 6.1 + 14}
                height={17}
                rx={3}
                fill="none"
                stroke={C.hackRed}
                strokeWidth={1.4}
              />
              <text
                x={f.x + 7}
                y={f.y + 12}
                fontFamily='"JetBrains Mono", monospace'
                fontSize={8}
                fill={C.hackRed}
              >
                {f.label}
              </text>
            </g>
          );
        })}
      </svg>

      <TalkingHead cardTop={804} tone="dark" />
    </AbsoluteFill>
  );
};
