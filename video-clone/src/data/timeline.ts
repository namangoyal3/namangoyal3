/**
 * Frame-accurate timeline transcribed from the source clip
 * (720x1280, 30fps, 1516 frames = 50.53s).
 *
 * Every `at` value is the first frame on which that caption state is visible in
 * the source. Cue text was read back off the burned-in captions, so the caption
 * track is a literal match rather than a re-transcription of the audio.
 */

export const FPS = 30;
export const WIDTH = 720;
export const HEIGHT = 1280;
export const DURATION = 1516;

/**
 * `word` – the bold sans caption that sits just above the talking-head card.
 * `display` – the Playfair italic caption used over full-frame b-roll.
 */
export type CaptionKind = 'word' | 'display';

export type Cue = {
  at: number;
  /** Lines of text. A second line is used by the "HERE ARE / 5 PLUGINS" cue. */
  lines: string[];
  kind: CaptionKind;
  /** Index of the line that renders in the accent colour, if any. */
  accentLine?: number;
  /** Trailing words rendered in grey (used by the "Markdown File" card). */
  greyTail?: number;
  /** Per-cue vertical nudge — a few shots drift their caption mid-scene. */
  dy?: number;
};

export const CUES: Cue[] = [
  // 1 — intro, Claude vs Codex
  {at: 0, lines: ['If your'], kind: 'word'},
  {at: 8, lines: ['vibe-coding'], kind: 'word'},
  {at: 23, lines: ['with'], kind: 'word'},
  {at: 26, lines: ['Claude'], kind: 'word'},
  {at: 34, lines: ['Claude Code'], kind: 'word'},
  {at: 39, lines: ['Codex'], kind: 'word'},

  // 2 — plugin installer
  {at: 60, lines: ['HERE ARE'], kind: 'display'},
  {at: 67, lines: ['HERE ARE', '5 PLUGINS'], kind: 'display', accentLine: 1},
  {at: 91, lines: ['YOU'], kind: 'display'},
  {at: 102, lines: ['YOU NEED'], kind: 'display'},
  {at: 109, lines: ['YOU NEED TO HAVE'], kind: 'display'},

  // 4 — Playwright: opening browsers
  {at: 170, lines: ['this will'], kind: 'word'},
  {at: 176, lines: ['give'], kind: 'word'},
  {at: 181, lines: ['your AI'], kind: 'word'},
  {at: 194, lines: ['the power'], kind: 'word'},
  {at: 208, lines: ['to open'], kind: 'word'},
  {at: 223, lines: ['browsers'], kind: 'word'},

  // 5 — Playwright: screenshotting
  {at: 241, lines: ['SCREENSHOT'], kind: 'display'},
  {at: 259, lines: ['WHAT IT'], kind: 'display'},
  {at: 268, lines: ['JUST'], kind: 'display'},
  {at: 272, lines: ['BUILT'], kind: 'display'},
  {at: 286, lines: ['CATCH'], kind: 'display'},

  // 6 — Playwright: console errors
  {at: 296, lines: ['MESSY'], kind: 'display'},
  {at: 305, lines: ['OUTPUTS'], kind: 'display'},
  {at: 319, lines: ['ERRORS'], kind: 'display'},
  {at: 329, lines: ['BEFORE'], kind: 'display'},
  {at: 336, lines: ['YOU GUYS'], kind: 'display'},
  {at: 352, lines: ['SEE IT'], kind: 'display'},

  // 8 — Supabase: realtime code
  {at: 414, lines: ['this will'], kind: 'word'},
  {at: 421, lines: ['help'], kind: 'word'},
  {at: 426, lines: ['build'], kind: 'word'},
  {at: 437, lines: ['entire'], kind: 'word'},
  {at: 452, lines: ['databases'], kind: 'word'},

  // 9 — Supabase dashboard
  {at: 472, lines: ['FOR YOUR'], kind: 'display'},
  {at: 481, lines: ['APPS AND'], kind: 'display'},
  {at: 493, lines: ['MANAGE'], kind: 'display'},
  {at: 503, lines: ['THEM'], kind: 'display'},
  {at: 508, lines: ['WITHOUT'], kind: 'display'},
  {at: 516, lines: ['EVER'], kind: 'display'},
  {at: 523, lines: ['HAVING'], kind: 'display'},
  {at: 530, lines: ['TO LEAVE'], kind: 'display'},
  {at: 539, lines: ['YOUR'], kind: 'display'},
  {at: 545, lines: ['TERMINAL'], kind: 'display'},

  // 11 — Strix: the attack
  {at: 588, lines: ['WHICH WILL'], kind: 'display'},
  {at: 600, lines: ['ATTACK'], kind: 'display'},
  {at: 611, lines: ['YOUR'], kind: 'display'},
  {at: 616, lines: ['VIBE'], kind: 'display'},
  {at: 623, lines: ['CODED'], kind: 'display'},
  {at: 632, lines: ['APP'], kind: 'display'},
  {at: 639, lines: ['JUST LIKE'], kind: 'display'},
  {at: 648, lines: ['A REAL'], kind: 'display'},
  {at: 656, lines: ['HACKER'], kind: 'display'},

  // 12 — Strix: findings
  {at: 667, lines: ['and find'], kind: 'word'},
  {at: 680, lines: ['and fix'], kind: 'word'},
  {at: 694, lines: ['any'], kind: 'word'},
  {at: 700, lines: ['security'], kind: 'word'},
  {at: 712, lines: ['vulnerabilities'], kind: 'word'},
  {at: 730, lines: ['that'], kind: 'word'},
  {at: 733, lines: ['you guys'], kind: 'word'},
  {at: 743, lines: ['left'], kind: 'word'},
  {at: 749, lines: ['behind'], kind: 'word'},

  // 14 — SkillUI terminal
  {at: 834, lines: ['YOU'], kind: 'display'},
  {at: 839, lines: ['POINTED AT'], kind: 'display'},
  {at: 856, lines: ['ANY SITE'], kind: 'display'},
  {at: 871, lines: ['YOU LIKE'], kind: 'display', dy: 75},
  {at: 881, lines: ['AND'], kind: 'display', dy: 75},
  {at: 888, lines: ['LITERALLY'], kind: 'display', dy: 75},
  {at: 902, lines: ['GO'], kind: 'display', dy: 75},
  {at: 907, lines: ['THROUGH'], kind: 'display', dy: 75},

  // 15 — SkillUI: reverse engineering
  {at: 912, lines: ['and'], kind: 'word'},
  {at: 917, lines: ['reverse'], kind: 'word'},
  {at: 925, lines: ['engineer'], kind: 'word'},
  {at: 938, lines: ['the whole'], kind: 'word'},
  {at: 948, lines: ['design'], kind: 'word'},
  {at: 959, lines: ['system'], kind: 'word'},
  {at: 967, lines: ['into a'], kind: 'word'},

  // 16 — CLAUDE.md card
  {at: 976, lines: ['Markdown'], kind: 'display', greyTail: 1},
  {at: 985, lines: ['Markdown File'], kind: 'display', greyTail: 1},

  // 17 — build in the same style
  {at: 1008, lines: ['your AI'], kind: 'word'},
  {at: 1022, lines: ['can'], kind: 'word'},
  {at: 1028, lines: ['build'], kind: 'word'},
  {at: 1039, lines: ['project'], kind: 'word'},
  {at: 1054, lines: ['in the'], kind: 'word'},
  {at: 1061, lines: ['exact'], kind: 'word'},
  {at: 1070, lines: ['same'], kind: 'word'},
  {at: 1076, lines: ['style'], kind: 'word'},

  // 19 — Context7 leaderboard
  {at: 1135, lines: ['which'], kind: 'word'},
  {at: 1141, lines: ['provides'], kind: 'word'},
  {at: 1151, lines: ['your'], kind: 'word'},
  {at: 1156, lines: ['coding'], kind: 'word'},
  {at: 1164, lines: ['assistant'], kind: 'word'},
  {at: 1176, lines: ['with the'], kind: 'word'},
  {at: 1184, lines: ['latest'], kind: 'word'},
  {at: 1194, lines: ['version'], kind: 'word'},
  {at: 1205, lines: ['of'], kind: 'word'},
  {at: 1210, lines: ['all of'], kind: 'word'},
  {at: 1222, lines: ['the'], kind: 'word'},

  // 20 — close-up
  {at: 1228, lines: ['libraries'], kind: 'word'},
  {at: 1248, lines: ['tools'], kind: 'word'},
  {at: 1256, lines: ['and'], kind: 'word'},
  {at: 1261, lines: ['dependencies'], kind: 'word'},
  {at: 1280, lines: ['that top'], kind: 'word'},
  {at: 1292, lines: ['performers'], kind: 'word'},
  {at: 1307, lines: ['use'], kind: 'word'},

  // 21 — Context7 platform page
  {at: 1314, lines: ["SO IT'LL"], kind: 'display'},
  {at: 1321, lines: ['NEVER'], kind: 'display'},
  {at: 1328, lines: ['HAVE TO'], kind: 'display'},
  {at: 1336, lines: ['CODE'], kind: 'display'},
  {at: 1344, lines: ['AGAINST'], kind: 'display'},
  {at: 1354, lines: ['AN'], kind: 'display'},
  {at: 1358, lines: ['OUTDATED'], kind: 'display'},
  {at: 1370, lines: ['VERSION AGAIN'], kind: 'display'},

  // 22 — outro
  {at: 1388, lines: ['so if'], kind: 'word'},
  {at: 1394, lines: ['you guys'], kind: 'word'},
  {at: 1400, lines: ['want'], kind: 'word'},
  {at: 1406, lines: ['to try'], kind: 'word'},
  {at: 1414, lines: ['all'], kind: 'word'},
  {at: 1418, lines: ['these'], kind: 'word'},
  {at: 1427, lines: ['yourselves'], kind: 'word'},
  {at: 1445, lines: ['just'], kind: 'word'},
  // The scene's own "comment / Coding" lockup takes over from here.
  {at: 1452, lines: [], kind: 'word'},
];

/** Scene cuts, transcribed from the source's shot boundaries. */
export type SceneId =
  | 'intro'
  | 'installer'
  | 'titlePlaywright'
  | 'openBrowser'
  | 'screenshot'
  | 'consoleErrors'
  | 'titleSupabase'
  | 'realtimeCode'
  | 'supabaseDash'
  | 'titleStrix'
  | 'strixAttack'
  | 'strixFindings'
  | 'titleSkillUi'
  | 'skillUiTerminal'
  | 'skillUiReverse'
  | 'claudeMd'
  | 'rampBroll'
  | 'titleContext7'
  | 'context7Table'
  | 'closeUp'
  | 'context7Page'
  | 'outro';

export type Scene = {id: SceneId; from: number; durationInFrames: number};

const CUTS: [SceneId, number][] = [
  ['intro', 0],
  ['installer', 55],
  ['titlePlaywright', 121],
  ['openBrowser', 170],
  ['screenshot', 241],
  ['consoleErrors', 296],
  ['titleSupabase', 362],
  ['realtimeCode', 414],
  ['supabaseDash', 472],
  ['titleStrix', 553],
  ['strixAttack', 588],
  ['strixFindings', 667],
  ['titleSkillUi', 762],
  ['skillUiTerminal', 834],
  ['skillUiReverse', 912],
  ['claudeMd', 976],
  ['rampBroll', 1008],
  ['titleContext7', 1086],
  ['context7Table', 1135],
  ['closeUp', 1228],
  ['context7Page', 1314],
  ['outro', 1388],
];

export const SCENES: Scene[] = CUTS.map(([id, from], i) => ({
  id,
  from,
  durationInFrames: (i + 1 < CUTS.length ? CUTS[i + 1][1] : DURATION) - from,
}));

/** Which cue (if any) is on screen at an absolute frame. */
export const cueAt = (frame: number): Cue | null => {
  let found: Cue | null = null;
  for (const c of CUES) {
    if (c.at <= frame) found = c;
    else break;
  }
  return found;
};
