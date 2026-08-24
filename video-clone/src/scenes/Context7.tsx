import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {CloseUpHead, TalkingHead} from '../components/AvatarPlaceholder';
import {DarkBg} from '../components/Backdrops';
import {enter, settle} from '../motion';

/**
 * Scene 19 (f1135–1227). Context7's library leaderboard. Rows stream in from
 * the top a few frames apart, matching the source's staggered reveal.
 */
const ROWS: [string, string, string, string, string][] = [
  ['Next.js', '/vercel/next.js', '87.6', '6K', '1 day'],
  ['OpenCode', '/anomaly/opencode', '83.9', '3.4K', '3 days'],
  ['Better Auth', '/better-auth/better-auth', '84.1', '5.1K', '1 day'],
  ['Supabase', '/supabase/supabase', '79.3', '21K', '3 days'],
  ['React', '/reactjs/react.dev', '88.6', '6.1K', '22 hours'],
  ['Playwright', '/microsoft/playwright', '82.9', '6.7K', '22 hours'],
  ['Expo', '/expo/expo', '81.7', '9.8K', '1 day'],
  ['Codex CLI', '/openai/codex', '78.2', '2.2K', '2 days'],
  ['Vitest', '/vitest-dev/vitest', '86.3', '4.7K', '3 days'],
  ['Stripe', '/docs.stripe.com', '71.0', '79K', '1 week'],
];

/** Column track, measured off the source's table. */
const COLS = '131px 186px 70px 63px 70px 43px';

export const Context7Table: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = Math.min(ROWS.length, Math.max(0, Math.round((frame - 2) / 2.6)));

  return (
    <AbsoluteFill>
      <DarkBg color="#07080d" />
      <div style={{position: 'absolute', left: 78, top: 176, width: 564}}>
        <div style={{display: 'grid', gridTemplateColumns: COLS, fontFamily: F.sans, fontSize: 10, color: '#7c848c'}}>
          <span>Name</span>
          <span>Source</span>
          <span style={{textAlign: 'right'}}>Benchmark</span>
          <span style={{textAlign: 'right'}}>Snippets</span>
          <span style={{textAlign: 'right'}}>Update</span>
          <span style={{textAlign: 'right'}}>Trust</span>
        </div>

        {ROWS.slice(0, shown).map(([name, src, bench, snip, upd], i) => (
          <div
            key={name}
            style={{
              display: 'grid',
              gridTemplateColumns: COLS,
              alignItems: 'center',
              height: 34.7,
              opacity: interpolate(frame - 2 - i * 2.6, [0, 5], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <span style={{fontFamily: F.sans, fontWeight: 700, fontSize: 13, color: '#25d0a0'}}>{name}</span>
            <span style={{fontFamily: F.mono, fontSize: 8.5, color: '#7c848c'}}>⌂ {src}</span>
            <span style={{fontFamily: F.sans, fontSize: 12, color: '#eef1f4', textAlign: 'right'}}>{bench}</span>
            <span style={{fontFamily: F.sans, fontSize: 12, color: '#eef1f4', textAlign: 'right'}}>{snip}</span>
            <span style={{fontFamily: F.sans, fontSize: 12, color: '#eef1f4', textAlign: 'right'}}>{upd}</span>
            <span style={{fontSize: 11, color: '#25d0a0', textAlign: 'right', letterSpacing: '0.12em'}}>✳✳✳</span>
          </div>
        ))}
      </div>

      <TalkingHead cardTop={804} tone="dark" />
    </AbsoluteFill>
  );
};

/**
 * Scene 21 (f1314–1387). The Context7 platform listing. The mint hero card and
 * language chips settle in, then the title bar highlights as if selected.
 */
const CHIPS: [string, string][] = [
  ['Website', '#3b4252'],
  ['context7.com', '#2d3441'],
  ['smithery badge', '#2d3441'],
  ['npm', '#4b5563'],
  ['v4.9.0', '#2f6f4f'],
  ['License', '#4b5563'],
  ['MIT', '#8a6d1f'],
  ['docs', '#3b4252'],
  ['한국어', '#2b6cb0'],
  ['docs', '#3b4252'],
  ['简体中文', '#9b2c2c'],
  ['docs', '#3b4252'],
  ['日本語', '#276749'],
  ['docs', '#3b4252'],
  ['Español', '#975a16'],
  ['docs', '#3b4252'],
  ['Français', '#2c5282'],
  ['docs', '#3b4252'],
  ['Português (Brasil)', '#553c9a'],
  ['docs', '#3b4252'],
  ['Italiano', '#822727'],
  ['docs', '#3b4252'],
  ['Bahasa Indonesia', '#285e61'],
  ['docs', '#3b4252'],
  ['Deutsch', '#4a5568'],
  ['docs', '#3b4252'],
  ['Русский', '#2a4365'],
  ['docs', '#3b4252'],
  ['Türkçe', '#744210'],
  ['docs', '#3b4252'],
  ['Tiếng Việt', '#22543d'],
];

export const Context7Page: React.FC = () => {
  const frame = useCurrentFrame();
  // The source flips the page title into an orange selection at ~f1348.
  const selected = frame >= 34;
  // Tracked: the page settles between f1314 and f1346, then holds still.
  const t = settle(frame, 32);

  return (
    <AbsoluteFill>
      <DarkBg color="#07080d" />
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 226,
          width: 536,
          ...enter(t, 1.07, 12),
          transformOrigin: '50% 30%',
        }}
      >
        <div
          style={{
            height: 172,
            borderRadius: 6,
            background: 'linear-gradient(135deg,#c9f5dd,#e4fbee)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 15, color: '#0e2f21', textAlign: 'center', lineHeight: 1.3}}>
            Up-to-date Docs
            <br />
            for LLMs and AI code editors
          </div>
          <div style={{fontFamily: F.sans, fontSize: 9, color: '#2c5c46', textAlign: 'center', lineHeight: 1.5}}>
            Get the latest documentation and code into
            <br />
            Cursor, Claude, or other LLMs
          </div>
        </div>

        <div style={{marginTop: 14, fontFamily: F.sans, fontSize: 8, color: '#8b93a0'}}>
          ⬚ Add to Cursor
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: 17,
            lineHeight: 1.35,
            color: selected ? '#ffffff' : '#e6edf3',
            background: selected ? C.claudeOrange : 'transparent',
            display: 'inline',
            boxDecorationBreak: 'clone',
            WebkitBoxDecorationBreak: 'clone',
          }}
        >
          Context7 Platform - Up-to-date Code Docs For Any Prompt
        </div>

        <div style={{marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 3}}>
          {CHIPS.map(([t, bg], i) => (
            <span
              key={i}
              style={{
                background: bg,
                color: '#e8edf3',
                fontFamily: F.sans,
                fontSize: 7,
                padding: '2px 5px',
                borderRadius: 2,
                opacity: interpolate(frame - i * 0.6, [0, 5], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Scene 20 (f1228–1313) and 22 (f1388–1515): full-bleed close-up shots. */
export const CloseUp: React.FC<{scale?: number}> = ({scale = 1.97}) => (
  <AbsoluteFill>
    <CloseUpHead tone="light" scale={scale} />
  </AbsoluteFill>
);

/** Scene 22 also stamps the "comment / Coding" call-to-action. */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  // The CTA lands at absolute f1465 → 77 frames into the scene.
  const cta = interpolate(frame, [77, 83], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const commentOnly = frame >= 64 && frame < 77;

  return (
    <AbsoluteFill>
      <CloseUpHead tone="light" scale={1.97} />

      {(commentOnly || cta > 0) && (
        <div
          style={{
            position: 'absolute',
            top: 900,
            left: 0,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: F.serif,
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 34,
              color: '#ffffff',
              textShadow: '0 4px 18px rgba(0,0,0,0.55)',
              transform: cta > 0 ? 'translateY(6px)' : 'none',
            }}
          >
            comment
          </div>
          <div
            style={{
              marginTop: -10,
              fontFamily: F.sans,
              fontWeight: 800,
              fontSize: 52,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              textShadow: '0 5px 22px rgba(0,0,0,0.6)',
              transform: `scale(${interpolate(cta, [0, 1], [0.8, 1])})`,
              opacity: cta,
            }}
          >
            “Coding”
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
