import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {Cue, cueAt, SCENES, SceneId} from '../data/timeline';

/**
 * Captions are hard cuts in the source — no fade, no scale pop.
 * Sampling the caption band across a cue boundary shows brightness switching in
 * a single frame and then holding dead constant:
 *
 *   f529: 4954   (previous cue)   f532: 5685
 *   f530: 5683   (new cue)        f533: 5687
 *   f531: 5684                    f534: 5684
 *
 * So nothing here animates. Anything that eased in would read as an invented
 * zoom, ~120 times over the film.
 */

type Tone = 'light' | 'dark';
type Style = {
  tone: Tone;
  /** Top of the caption block, in frame pixels. */
  wordTop?: number;
  displayTop?: number;
  /** Anchor the caption block by its baseline row instead of its top. */
  displayBottom?: number;
  /** Anchor by vertical centre — how most of the b-roll captions sit. */
  displayCenter?: number;
  wordSize?: number;
  displaySize?: number;
  /** Horizontal squeeze — the source's display face is narrower than Playfair. */
  displayStretch?: number;
};

/**
 * Per-scene caption placement, measured off the source. Scenes with a
 * talking-head card put the sans caption just above the card lip (~y=560);
 * full-bleed close-ups push it down to ~y=880.
 */
const STYLES: Record<SceneId, Style> = {
  intro: {tone: 'light', wordTop: 570},
  installer: {tone: 'light', displayCenter: 918},
  titlePlaywright: {tone: 'light'},
  openBrowser: {tone: 'light', wordTop: 570},
  screenshot: {tone: 'light', displayCenter: 863},
  consoleErrors: {tone: 'dark', displayCenter: 790},
  titleSupabase: {tone: 'light'},
  realtimeCode: {tone: 'light', wordTop: 570},
  supabaseDash: {tone: 'dark', displayCenter: 797},
  titleStrix: {tone: 'dark'},
  strixAttack: {tone: 'dark', displayCenter: 919, displaySize: 84},
  strixFindings: {tone: 'dark', wordTop: 570},
  titleSkillUi: {tone: 'light'},
  skillUiTerminal: {tone: 'dark', displayCenter: 763},
  skillUiReverse: {tone: 'light', wordTop: 570},
  claudeMd: {tone: 'light', displayCenter: 814},
  rampBroll: {tone: 'light', wordTop: 570},
  titleContext7: {tone: 'light'},
  context7Table: {tone: 'dark', wordTop: 570},
  closeUp: {tone: 'dark', wordTop: 872, wordSize: 46},
  context7Page: {tone: 'dark', displayCenter: 809},
  outro: {tone: 'dark', wordTop: 872, wordSize: 46},
};

const sceneAt = (frame: number) => {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (frame >= SCENES[i].from) return SCENES[i];
  }
  return SCENES[0];
};

const WordCaption: React.FC<{cue: Cue; s: Style}> = ({cue, s}) => {
  const dark = s.tone === 'dark';
  return (
    <div
      style={{
        position: 'absolute',
        top: s.wordTop ?? 560,
        left: 0,
        width: '100%',
        textAlign: 'center',
        fontFamily: F.sans,
        fontWeight: 800,
        fontSize: s.wordSize ?? 52,
        letterSpacing: '-0.025em',
        color: dark ? C.white : C.ink,
        textShadow: dark ? '0 3px 20px rgba(0,0,0,0.6)' : 'none',
      }}
    >
      {cue.lines.join(' ')}
    </div>
  );
};

const DisplayCaption: React.FC<{cue: Cue; s: Style}> = ({cue, s}) => {
  const dark = s.tone === 'dark';
  const size = s.displaySize ?? 63;
  const stretch = s.displayStretch ?? 0.85;
  const lineH = size * 1.36;
  // Playfair's cap height sits ~0.18em below the line box top.
  const capInset = size * 0.18;
  const blockH = cue.lines.length * lineH;
  const top =
    (s.displayCenter !== undefined
      ? s.displayCenter - blockH / 2 - capInset / 2
      : s.displayBottom !== undefined
      ? s.displayBottom - blockH
      : s.displayTop ?? 1000) + (cue.dy ?? 0);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        width: '100%',
        textAlign: 'center',
        fontFamily: F.serif,
        fontStyle: 'italic',
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.36,
        color: dark ? C.white : C.ink,
        textShadow: dark
          ? '0 6px 26px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.55)'
          : '0 5px 18px rgba(0,0,0,0.25)',
        transform: `scaleX(${stretch})`,
        whiteSpace: 'pre',
      }}
    >
      {cue.lines.map((line, i) => {
        const words = line.split(' ');
        const greyFrom = cue.greyTail ? words.length - cue.greyTail : Infinity;
        return (
          <div
            key={i}
            style={{color: cue.accentLine === i ? C.claudeOrange : undefined}}
          >
            {words.map((w, wi) => (
              <span
                key={wi}
                style={{color: wi >= greyFrom ? '#9c9c9c' : undefined}}
              >
                {w}
                {wi < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Single caption layer for the whole film. Reading the cue track at absolute
 * frames — rather than per scene — is what keeps the caption timing identical
 * to the source across shot cuts.
 */
export const CaptionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = cueAt(frame);
  if (!cue || cue.lines.join('') === '') return null;

  const scene = sceneAt(frame);
  // A cue only shows inside the scene it was authored for.
  if (cue.at < scene.from) return null;

  const s = STYLES[scene.id];
  return cue.kind === 'word' ? (
    <WordCaption cue={cue} s={s} />
  ) : (
    <DisplayCaption cue={cue} s={s} />
  );
};
