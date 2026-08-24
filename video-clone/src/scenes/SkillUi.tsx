import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {TalkingHead} from '../components/AvatarPlaceholder';
import {DarkBg, LeafWallBg} from '../components/Backdrops';
import {Terminal} from '../components/Chrome';
import {PixelCrab} from '../components/Icons';

/**
 * Scene 14 (f834–911). The SkillUI CLI run. The shot opens tight on the
 * banner, pulls back through the typed command, and ends on the extraction
 * report with the next-step commands boxed in orange.
 */

const REPORT = `Keyframes: 36 extracted
Scroll patterns: 1 types
✓ Ultra extraction  7 scroll frames · 36 keyframes · Web Animations API (47 active)
✓ DESIGN.md   /Users/skep/notion-design/DESIGN.md
✓ .skill package  /Users/skep/notion-design/notion-design.skill`;

const EXTRACTION: [string, string][] = [
  ['Colors', '20 extracted'],
  ['Fonts', '3 families'],
  ['Grid', '4px baseline'],
  ['Components', '6 patterns'],
  ['Animations', '74 detected'],
  ['Framework', 'none detected'],
  ['Dark mode', 'not detected'],
  ['Keyframes', '36 extracted'],
  ['Scroll frames', '7 captured'],
  ['Animation stack', 'Web Animations API (47 active)'],
  ['Video elements', '1 (1 background)'],
];

export const SkillUiTerminal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Three beats, each with its own framing in the source:
  //   f834–849  tight on the ASCII banner
  //   f850–870  the typed command inside an orange box
  //   f871–911  the full extraction report
  const beat = frame < 16 ? 0 : frame < 37 ? 1 : 2;
  const cmd = 'skillui --url https://notion.com/ --mode ultra';
  const typed = cmd.slice(0, Math.max(0, Math.round((frame - 15) * 3.4)));
  const boxed = spring({frame: frame - 38, fps, config: {damping: 16, mass: 0.6}});

  return (
    <AbsoluteFill>
      <DarkBg color="#0a0a0c" />

      {beat === 0 && (
        <div style={{position: 'absolute', left: 30, top: 230}}>
          <Terminal width={540} height={300} style={{fontSize: 13, lineHeight: 1.5}}>
            <span style={{color: '#6f7681'}}>$ npx skillui --url https://notion.com/ --mode ultra</span>
            {'\n'}
            <span
              style={{
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 46,
                color: C.claudeOrangeSoft,
                lineHeight: 1.35,
              }}
            >
              {'\n'}SKILLUI{'\n'}
            </span>
            <span style={{color: '#8a919c'}}>
              {'\n'}Reverse-engineer any design system — No AI. No API keys. No cloud.
              {'\n'}
              {'\n'}  Site crawling      Live URL + Full CSS + DOM analysis
              {'\n'}  JS/CSS/TSX/JSX     token extraction
              {'\n'}  Repo cloning       Clone + scan + package automatically
              {'\n'}  Ultra mode         7 scroll frames, keyframes, interactions
              {'\n'}  Skill packaging    One ZIP, drop into Claude Code
              {'\n'}  No API keys        Pure static analysis, no cloud
            </span>
          </Terminal>
        </div>
      )}

      {beat === 1 && (
        <div style={{position: 'absolute', left: 103, top: 385}}>
          <Terminal width={537} height={275} border={C.claudeOrangeSoft} style={{fontSize: 20, padding: 16}}>
            {typed}
            <span style={{background: '#e6e9ee', color: '#0b0d10'}}> </span>
          </Terminal>
        </div>
      )}

      {beat === 2 && (
        <div
          style={{
            position: 'absolute',
            left: 385,
            top: 392,
            transform: 'translate(-50%,-50%)',
          }}
        >
          <div style={{width: 570, fontFamily: F.mono, fontSize: 8.5, color: '#9aa2ad', lineHeight: 1.55, whiteSpace: 'pre'}}>
            {REPORT}
            <div style={{marginTop: 10, border: '1px solid #b05fd0', borderRadius: 3, padding: '6px 8px'}}>
              <div style={{color: '#c77fe0'}}>Extraction Complete</div>
              {EXTRACTION.map(([k, v]) => (
                <div key={k} style={{display: 'flex'}}>
                  <span style={{width: 150, color: '#9aa2ad'}}>  {k}</span>
                  <span style={{color: '#c6cdd6'}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop: 8, border: '1px solid #3f7f56', borderRadius: 3, padding: '6px 8px'}}>
              <div style={{color: '#63c98a'}}>Output files</div>
              <div>  DESIGN.md      ./notion-design/DESIGN.md</div>
              <div>  notion.skill   ./notion-design/notion-design.skill</div>
            </div>
            <div style={{marginTop: 8, border: '1px solid #3f7f56', borderRadius: 3, padding: '6px 8px'}}>
              <div style={{color: '#63c98a'}}>Next steps</div>
              <div>  Open Claude Code inside the design folder:</div>
              <div style={{color: '#e0e5ec'}}>    cd notion-design {'&&'} claude</div>
              <div>{'\n'}  Claude will auto-read CLAUDE.md and SKILL.md. Then ask:</div>
              <div>    "Build me a UI that matches this design system"</div>
            </div>
            <div
              style={{
                marginTop: 12,
                border: `2px solid ${C.claudeOrange}`,
                borderRadius: 4,
                padding: '5px 8px',
                color: '#e0e5ec',
                transform: `scale(${interpolate(boxed, [0, 1], [0.97, 1])})`,
                opacity: boxed,
              }}
            >
              <div>amaan@vibecode ~ cd notion-design</div>
              <div>
                amaan@vibecode ~/notion-design cla
                <span style={{background: '#e0e5ec', color: '#0b0d10'}}> </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/**
 * Scene 15 (f912–975). Back on the wall backdrop: the same terminal, small,
 * above the talking-head card while the narration lands.
 */
export const SkillUiReverse: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = [
    'Keyframes: 36 extracted',
    'Scroll patterns: 1 types',
    '✓ Ultra extraction  7 scroll frames · 36 keyframes · Web Animations API',
    '✓ DESIGN.md         /Users/skep/notion-design/DESIGN.md',
    '✓ .skill package    /Users/skep/notion-design/notion-design.skill',
    '',
    'Output files',
    '  DESIGN.md      ./notion-design/DESIGN.md',
    '  notion.skill   ./notion-design/notion-design.skill',
    '',
    'Next steps',
    '  Open Claude Code inside the design folder:',
    '    cd notion-design && claude',
    '',
    '  Claude will auto-read CLAUDE.md and SKILL.md. Then ask:',
    '    "Build me a UI that matches this design system"',
  ];  const shown = Math.min(lines.length, Math.max(1, Math.round(frame / 1.6)));

  return (
    <AbsoluteFill>
      <LeafWallBg />
      <div style={{position: 'absolute', left: 80, top: 144}}>
        <Terminal width={560} height={335} style={{fontSize: 11}}>
          {lines.slice(0, shown).map((l, i) => (
            <div key={i} style={{color: l.startsWith('✓') ? '#63c98a' : '#9aa2ad'}}>
              {l}
            </div>
          ))}
          <div style={{marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, color: '#c6cdd6'}}>
            <PixelCrab size={16} />
            <span>Claude Code v2.0.1 — reading 5 files…</span>
          </div>
        </Terminal>
      </div>
      <TalkingHead cardTop={804} tone="light" />
    </AbsoluteFill>
  );
};

/**
 * Scene 16 (f976–1007). The CLAUDE.md card: crab, filename, and a dark
 * markdown preview that springs in under it.
 */
export const ClaudeMd: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sheet = spring({frame: frame - 4, fps, config: {damping: 15, mass: 0.7}});

  const md = [
    ['# CLAUDE.md', '#d97757'],
    ['', ''],
    ['This file guides Claude Code inside this repo.', '#9aa2ad'],
    ['', ''],
    ['## Commands', '#d97757'],
    ['- npm run dev', '#9aa2ad'],
    ['- npm test', '#9aa2ad'],
    ['', ''],
    ['## Code style', '#d97757'],
    ['- Typescript strict mode', '#9aa2ad'],
    ['- Functional components only', '#9aa2ad'],
    ['', ''],
    ['## Project structure', '#d97757'],
    ['- src/ — application source', '#9aa2ad'],
    ['- remotion/ — video compositions', '#9aa2ad'],
  ];

  return (
    <AbsoluteFill style={{background: C.white}}>
      <div style={{position: 'absolute', top: 164, left: 0, width: '100%', textAlign: 'center'}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <PixelCrab size={46} />
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 26,
            color: C.ink,
            letterSpacing: '0.02em',
          }}
        >
          CLAUDE.md
        </div>
        <div style={{marginTop: 5, fontFamily: F.sans, fontSize: 12, color: '#9a958d'}}>
          project instructions for Claude Code
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 280,
          width: 440,
          height: 414,
          borderRadius: 12,
          background: '#1a1310',
          boxShadow: '0 30px 60px rgba(0,0,0,0.28)',
          overflow: 'hidden',
          transform: `translateY(${interpolate(sheet, [0, 1], [24, 0])}px) scale(${interpolate(
            sheet,
            [0, 1],
            [0.94, 1]
          )})`,
          opacity: sheet,
        }}
      >
        <div style={{height: 20, background: '#241a15', display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 9}}>
          <PixelCrab size={11} />
          <span style={{fontFamily: F.mono, fontSize: 7, color: '#b9ada4'}}>CLAUDE.md</span>
        </div>
        <div style={{padding: '10px 12px', fontFamily: F.mono, fontSize: 8, lineHeight: 1.75}}>
          {md.map(([t, c], i) => (
            <div key={i} style={{display: 'flex'}}>
              <span style={{width: 16, color: '#4a3a32'}}>{i + 1}</span>
              <span style={{color: c || '#9aa2ad'}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Scene 17 (f1008–1085). Ramp-style marketing site b-roll scrolling behind the
 * talking-head card.
 */
export const RampBroll: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [0, 78], [0, 150], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <LeafWallBg />
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 181,
          width: 576,
          height: 309,
          borderRadius: 12,
          background: '#141a33',
          boxShadow: '0 22px 48px rgba(60,60,80,0.28)',
          overflow: 'hidden',
        }}
      >
        {/* sticky nav — stays put while the page scrolls under it */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            height: 26,
            background: '#141a33',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 14px',
            fontFamily: F.sans,
            fontSize: 6.4,
            color: '#9fa7c8',
          }}
        >
          {['Product', 'Figma', 'Solutions', 'Customers', 'Pricing', 'Request a demo'].map((t) => (
            <span key={t}>{t}</span>
          ))}
          <span
            style={{
              marginLeft: 'auto',
              background: '#3d5bf0',
              color: '#fff',
              padding: '3px 8px',
              borderRadius: 4,
            }}
          >
            Get started
          </span>
        </div>

        <div style={{transform: `translateY(${-scroll}px)`, paddingTop: 26}}>
          {/* hero */}
          <div style={{height: 274, padding: 18, background: '#141a33'}}>
            <div style={{marginTop: 10, textAlign: 'center', fontFamily: F.sans, fontWeight: 700, fontSize: 22, color: '#fff'}}>
              Meet the night shift.
            </div>
            <div style={{marginTop: 8, textAlign: 'center', fontFamily: F.sans, fontSize: 6.4, color: '#9fa7c8', lineHeight: 1.7}}>
              Ramp agents work around the clock to close your books, chase receipts,
              <br />
              render approvals, and push projects forward — all while you sleep.
            </div>
            <div
              style={{
                margin: '14px auto 0',
                width: 330,
                height: 130,
                borderRadius: 8,
                background: '#f4f5fa',
                padding: 9,
              }}
            >
              <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 7, color: '#1b1f2e'}}>
                🟠 Ramp HQ
              </div>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{height: 8, marginTop: 7, borderRadius: 2, background: i % 2 ? '#e6e8f0' : '#eef0f6'}} />
              ))}
            </div>
          </div>
          {/* second panel */}
          <div style={{height: 300, background: '#f7f4ec', padding: 18}}>
            <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 17, color: '#171a24', lineHeight: 1.2}}>
              Keep work
              <br />
              moving 24/7.
            </div>
            <div style={{marginTop: 10, fontFamily: F.sans, fontSize: 6.4, color: '#6b6f7d'}}>
              Automate repetitive work for your team.
            </div>
            <div style={{marginTop: 12, display: 'flex', gap: 10}}>
              <div style={{width: 158, height: 74, borderRadius: 7, background: '#fff', border: '1px solid #e7e2d6'}} />
              <div style={{width: 158, height: 74, borderRadius: 7, background: '#fdf0d8', border: '1px solid #f0dfb8'}} />
            </div>
          </div>
        </div>
      </div>
      <TalkingHead cardTop={804} tone="light" />
    </AbsoluteFill>
  );
};
