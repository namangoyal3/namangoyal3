import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {TalkingHead} from '../components/AvatarPlaceholder';
import {DarkBg} from '../components/Backdrops';
import {settle} from '../motion';
import {StrixMark} from '../components/Icons';

/**
 * Scene 11 (f588–666). Strix's scanner ring spins above a mock startup page.
 * Ring and page go from white to red as the "breach" lands, then the page is
 * stamped BREACHED and the shot ends on a red warning card.
 */
/** Small red mono label the scanner pins next to each finding. */
const Chip: React.FC<{label: string; show: boolean}> = ({label, show}) => (
  <span
    style={{
      background: C.hackRed,
      color: '#1a0505',
      fontFamily: F.mono,
      fontSize: 6.5,
      letterSpacing: '0.08em',
      padding: '3px 6px',
      borderRadius: 3,
      opacity: show ? 1 : 0,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);

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
  // Tracked: the page shrinks from 526px to 478px wide between f588 and f620,
  // then holds exactly still until the warning card replaces it at f652.
  const pageIn = settle(frame, 32);
  const warn = interpolate(frame, [62, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <DarkBg />

      {/* scanner ring */}
      <svg width={720} height={300} viewBox="0 0 720 300" style={{position: 'absolute', top: 127, left: 0}}>
        <g transform={`rotate(${spin} 350 150)`}>
          {[0, 1, 2].map((i) => (
            <ellipse
              key={i}
              cx={350}
              cy={150}
              rx={114 - i * 8}
              ry={124 - i * 9}
              fill="none"
              stroke={markColor}
              strokeWidth={2}
              strokeDasharray={`${76 + i * 24} ${206 + i * 10}`}
              opacity={0.85 - i * 0.2}
            />
          ))}
        </g>
        <g transform="translate(350 150)">
          <g transform="translate(-38 -48)">
            <StrixMark size={76} height={96} color={markColor} />
          </g>
        </g>
      </svg>

      {/* the vulnerability counter the source prints above the card */}
      <div
        style={{
          position: 'absolute',
          right: 120,
          top: 484,
          fontFamily: F.mono,
          fontSize: 8,
          letterSpacing: '0.12em',
          color: C.hackRed,
          opacity: red * (1 - warn),
        }}
      >
        3 VULNERABILITIES FOUND
      </div>

      {/* target page — settles over the first 32 frames, then locked */}
      <div
        style={{
          position: 'absolute',
          left: 96 + pageIn * 18,
          top: 490 + pageIn * 14,
          width: 502 - pageIn * 24,
          height: 297 - pageIn * 13,
          borderRadius: 10,
          background: '#0e1018',
          border: `1px solid ${red > 0.5 ? '#3a1418' : '#1e2230'}`,
          overflow: 'hidden',
          opacity: 1 - warn,
        }}
      >
        {/* title bar */}
        <div style={{height: 20, display: 'flex', alignItems: 'center', paddingLeft: 8, gap: 4}}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{width: 5, height: 5, borderRadius: 3, background: '#3a4050'}} />
          ))}
          <span
            style={{
              marginLeft: 10,
              padding: '2px 8px',
              borderRadius: 8,
              background: '#161a26',
              fontFamily: F.mono,
              fontSize: 6,
              color: '#6a7185',
            }}
          >
            my-startup.app/admin?id=1
          </span>
        </div>

        <div style={{position: 'relative', padding: '10px 16px', height: '100%'}}>
          {/* the purple glow the source has bleeding in from the right */}
          <div
            style={{
              position: 'absolute',
              right: -30,
              top: -14,
              width: 130,
              height: 130,
              borderRadius: 65,
              background: 'radial-gradient(circle, rgba(120,105,225,0.55), rgba(120,105,225,0) 70%)',
            }}
          />

          <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 17, color: '#f0f3fa', letterSpacing: '-0.02em'}}>
            Welcome to my startup 🚀
          </div>
          <div style={{height: 5, width: '76%', borderRadius: 3, background: '#1b2030', marginTop: 12}} />
          <div style={{height: 5, width: '58%', borderRadius: 3, background: '#1b2030', marginTop: 5}} />

          {/* the leaked key, boxed in red once the scan lands */}
          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 12}}>
            <div
              style={{
                border: `1.5px solid ${red > 0.4 ? C.hackRed : '#242a3a'}`,
                borderRadius: 5,
                padding: '6px 9px',
                fontFamily: F.mono,
                fontSize: 8,
                color: '#8b93a8',
              }}
            >
              const apiKey = "sk_live_51H8k...";
            </div>
            <Chip label="API KEY EXPOSED" show={red > 0.4} />
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 10}}>
            <div
              style={{
                border: `1.5px solid ${red > 0.6 ? C.hackRed : 'transparent'}`,
                borderRadius: 7,
                padding: 3,
              }}
            >
              <div
                style={{
                  width: 62,
                  height: 22,
                  borderRadius: 5,
                  background: '#3b57e0',
                  color: '#fff',
                  fontFamily: F.sans,
                  fontWeight: 700,
                  fontSize: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Sign Up
              </div>
            </div>
            <Chip label="NO AUTH CHECK" show={red > 0.6} />
          </div>

          <div style={{position: 'absolute', right: 14, top: 12}}>
            <Chip label="SQL INJECTION" show={red > 0.2} />
          </div>

          {/* the jagged red fracture lines that tear across the page */}
          <svg
            width={502}
            height={300}
            viewBox="0 0 502 300"
            style={{position: 'absolute', left: -16, top: -20, opacity: red}}
          >
            {[
              'M 96 -20 L 68 60 L 118 128 L 60 208 L 96 320',
              'M 232 -20 L 268 74 L 214 150 L 262 236 L 226 320',
              'M 372 -20 L 344 70 L 398 140 L 342 226 L 386 320',
            ].map((d, i) => (
              <path
                key={i}
                d={d}
                stroke={C.hackRed}
                strokeWidth={1.6}
                fill="none"
                opacity={0.85}
                strokeDasharray={620}
                strokeDashoffset={620 - 620 * scanY}
              />
            ))}
          </svg>

          {/* BREACHED stamp */}
          <div
            style={{
              position: 'absolute',
              left: 186,
              top: 104,
              padding: '7px 18px',
              border: `2.5px solid ${C.hackRed}`,
              borderRadius: 5,
              color: '#ffffff',
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '0.04em',
              textShadow: `0 0 14px ${C.hackRed}`,
              boxShadow: `0 0 20px rgba(255,59,48,0.5)`,
              transform: `rotate(-5deg) scale(${breached})`,
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
/**
 * The four findings, with the frames they land on. Timing comes from tracking
 * the red pixels in the source across the shot: the connector sweeps in at
 * f685, then the callouts arrive top (f697), right (f709), left (f715) and
 * bottom (f733).
 */
const FINDINGS = [
  {label: 'NO RATE LIMITING', x: 474, y: 53, at: 30},
  {label: 'EXPOSED ADMIN ROUTE', x: 536, y: 161, at: 42},
  {label: 'WEAK PASSWORD POLICY', x: 38, y: 183, at: 48},
  {label: 'HARDCODED API KEY', x: 313, y: 305, at: 66},
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
          top: 230,
          fontFamily: F.mono,
          fontSize: 7.5,
          letterSpacing: '0.16em',
          color: '#5a6270',
        }}
      >
        VULNERABILITY SCAN
      </div>
      <div
        style={{
          position: 'absolute',
          right: 173,
          top: 230,
          fontFamily: F.mono,
          fontSize: 7.5,
          letterSpacing: '0.12em',
          color: C.hackRed,
        }}
      >
        4/4 FOUND
      </div>

      {/* the page under scan — locked at x=172..547 / y=252..474 in the source */}
      <div
        style={{
          position: 'absolute',
          left: 172,
          top: 252,
          width: 375,
          height: 222,
          borderRadius: 8,
          background: '#0b0d14',
          border: '1px solid #191d28',
          overflow: 'hidden',
        }}
      >
        <div style={{height: 13, display: 'flex', alignItems: 'center', paddingLeft: 6, gap: 3}}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{width: 3.5, height: 3.5, borderRadius: 2, background: '#2f3648'}} />
          ))}
          <span style={{marginLeft: 7, padding: '1px 6px', borderRadius: 6, background: '#12151f', fontFamily: F.mono, fontSize: 4.4, color: '#525a6c'}}>
            nimbus.app
          </span>
        </div>

        {/* site nav */}
        <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', height: 16}}>
          <span style={{width: 8, height: 8, borderRadius: 2, background: '#5b63d3'}} />
          <span style={{fontFamily: F.sans, fontWeight: 700, fontSize: 6, color: '#e8ecf5'}}>Nimbus</span>
          {['Product', 'Pricing', 'Docs'].map((t) => (
            <span key={t} style={{fontFamily: F.sans, fontSize: 4.6, color: '#5c6478'}}>{t}</span>
          ))}
          <span style={{marginLeft: 'auto', fontFamily: F.sans, fontSize: 4.6, color: '#5c6478'}}>Sign In</span>
          <span style={{background: '#3b57e0', color: '#fff', fontFamily: F.sans, fontSize: 4.6, padding: '2px 6px', borderRadius: 3}}>
            Get Started
          </span>
        </div>

        <div style={{display: 'flex', padding: '8px 10px', gap: 8}}>
          <div style={{flex: 1}}>
            <span style={{fontFamily: F.mono, fontSize: 3.6, color: '#5c6478', border: '1px solid #232838', borderRadius: 5, padding: '1px 4px'}}>
              NEW · AI WORKFLOWS
            </span>
            <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 13.5, color: '#f0f3fa', lineHeight: 1.18, marginTop: 6, letterSpacing: '-0.02em'}}>
              Automate your
              <br />
              entire workflow.
            </div>
            <div style={{fontFamily: F.sans, fontSize: 4.2, color: '#5c6478', lineHeight: 1.7, marginTop: 5}}>
              Nimbus connects your tools and ships the
              <br />
              busywork to AI agents, so your team ships
              <br />
              product instead of process.
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 7, marginTop: 8}}>
              <span style={{background: '#3b57e0', color: '#fff', fontFamily: F.sans, fontSize: 4.8, padding: '3px 8px', borderRadius: 3}}>
                Get Started
              </span>
              <span style={{fontFamily: F.sans, fontSize: 4.4, color: '#8890a4'}}>Watch demo →</span>
            </div>
          </div>

          {/* admin overview card */}
          <div style={{width: 132, position: 'relative'}}>
            <div
              style={{
                position: 'absolute',
                right: -12,
                top: -6,
                width: 118,
                height: 118,
                borderRadius: 59,
                background: 'radial-gradient(circle, rgba(91,99,211,0.42), rgba(91,99,211,0) 68%)',
              }}
            />
            <div style={{position: 'relative', background: '#10131e', border: '1px solid #1c2130', borderRadius: 5, padding: 6}}>
              <div style={{display: 'flex', fontFamily: F.sans, fontSize: 4, color: '#8890a4'}}>
                <span style={{fontWeight: 700, color: '#e8ecf5'}}>Admin Overview</span>
                <span style={{marginLeft: 'auto'}}>Last 7d</span>
              </div>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 4, height: 34, marginTop: 6}}>
                {[14, 20, 17, 28, 22, 19, 25].map((h, i) => (
                  <div key={i} style={{width: 11, height: h, background: '#5b63d3', borderRadius: 1}} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* feature row */}
        <div style={{display: 'flex', gap: 6, padding: '0 10px'}}>
          {[
            ['Instant sync', 'Two-way sync across every connected tool.'],
            ['Integrate in seconds', 'Drop-in connectors for the stack you run.'],
            ['Live reporting', 'Dashboards that update themselves.'],
          ].map(([t, d]) => (
            <div key={t} style={{flex: 1, background: '#0e111a', border: '1px solid #171b26', borderRadius: 4, padding: 5}}>
              <span style={{width: 6, height: 6, borderRadius: 2, background: '#2b3350', display: 'block'}} />
              <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 4.4, color: '#dfe4ef', marginTop: 4}}>{t}</div>
              <div style={{fontFamily: F.sans, fontSize: 3.6, color: '#525a6c', marginTop: 2, lineHeight: 1.5}}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* the red sweep the source draws across the findings view */}
      <div
        style={{
          position: 'absolute',
          left: 175,
          right: 177,
          top: 275,
          height: 2,
          background: C.hackRed,
          opacity: interpolate(frame, [18, 26], [0, 0.9], {
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
                width={f.label.length * 6.4 + 16}
                height={19}
                rx={3}
                fill="rgba(255,59,48,0.08)"
                stroke={C.hackRed}
                strokeWidth={1.6}
              />
              <text
                x={f.x + 8}
                y={f.y + 13.5}
                fontFamily='"JetBrains Mono", monospace'
                fontSize={8.5}
                letterSpacing="0.06em"
                fill={C.hackRed}
              >
                {f.label}
              </text>
              <circle
                cx={f.x < 360 ? 200 : 500}
                cy={f.y + 9}
                r={3}
                fill={C.hackRed}
              />
            </g>
          );
        })}
      </svg>

      <TalkingHead cardTop={804} tone="dark" />
    </AbsoluteFill>
  );
};
