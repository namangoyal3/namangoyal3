import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {CodeDocsIcon} from '../components/Icons';

/**
 * Scene 2 (f55–120). A fake "Claude Code — Plugin Installer" progress card on
 * the beige field, with five hand-drawn arrows counting the plugins in.
 *
 * Source beats: card fades up (f55), numbers 1–5 land one by one with arrows
 * (f64+), bar fills to 100% around f95, then turns orange and reads
 * "Plugin installed" at f112 while the arrows fade out.
 */

const ARROWS = [
  {n: '1', x: 179, y: 350, ax: 198, ay: 364, bx: 300, by: 410},
  {n: '2', x: 264, y: 257, ax: 276, ay: 272, bx: 328, by: 406},
  {n: '3', x: 364, y: 231, ax: 370, ay: 246, bx: 362, by: 404},
  {n: '4', x: 455, y: 261, ax: 456, ay: 276, bx: 398, by: 406},
  {n: '5', x: 551, y: 369, ax: 542, ay: 382, bx: 432, by: 412},
];

export const Installer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const cardIn = spring({frame, fps, config: {damping: 16, mass: 0.6}});

  // Progress: 0 → 100% between f10 and f40 of the scene.
  const pct = Math.round(
    interpolate(frame, [2, 32], [0, 100], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const done = frame >= 52; // absolute f107
  const label = done
    ? '✓ Claude Code Plugin installed'
    : pct >= 100
    ? 'Configuring agent instructions…'
    : pct >= 40
    ? 'Installing plugin files…'
    : 'Downloading Claude Code Plugin…';

  // The arrows fade once the install lands; the numbers stay up.
  const arrowsOut = interpolate(frame, [46, 56], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: C.installerBg}}>
      <svg
        width={720}
        height={1280}
        viewBox="0 0 720 1280"
        style={{position: 'absolute', inset: 0}}
      >
        {ARROWS.map((a, i) => {
          const t = spring({
            frame: frame - 4 - i * 3,
            fps,
            config: {damping: 15, mass: 0.5},
          });
          return (
            <g key={a.n} opacity={t}>
              <text
                x={a.x}
                y={a.y}
                fontFamily='"Playfair Display", serif'
                fontStyle="italic"
                fontWeight={700}
                fontSize={54}
                fill={C.claudeOrange}
                textAnchor="middle"
              >
                {a.n}
              </text>
              <g opacity={arrowsOut}>
                <path
                  d={`M ${a.ax} ${a.ay} Q ${(a.ax + a.bx) / 2 + 3} ${
                    (a.ay + a.by) / 2 - 6
                  } ${a.bx} ${a.by}`}
                  stroke={C.installerInk}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={260}
                  strokeDashoffset={260 - 260 * t}
                />
                <path
                  d={`M ${a.bx - 8} ${a.by - 13} L ${a.bx} ${a.by} L ${a.bx + 10} ${
                    a.by - 9
                  }`}
                  stroke={C.installerInk}
                  strokeWidth={2.5}
                  fill="none"
                  opacity={t > 0.85 ? 1 : 0}
                />
              </g>
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          top: 432,
          left: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${interpolate(cardIn, [0, 1], [16, 0])}px)`,
          opacity: cardIn,
        }}
      >
        <CodeDocsIcon size={186} />
        <div
          style={{
            marginTop: 26,
            fontFamily: F.sans,
            fontWeight: 800,
            fontSize: 42,
            letterSpacing: '-0.02em',
            color: C.installerInk,
          }}
        >
          Claude Code
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: F.sans,
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '0.22em',
            color: C.installerMuted,
          }}
        >
          PLUGIN INSTALLER
        </div>

        <div style={{marginTop: 30, width: 463}}>
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: done ? 'rgba(217,119,87,0.28)' : 'rgba(27,26,24,0.16)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                borderRadius: 3,
                background: done ? C.claudeOrange : C.installerInk,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: F.mono,
              fontSize: 12,
              color: done ? C.claudeOrange : C.installerMuted,
            }}
          >
            <span>{label}</span>
            <span>{pct}%</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
