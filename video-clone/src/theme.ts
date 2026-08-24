/**
 * Palette + type scale sampled directly from the source video
 * (see tools/README.md for how the values were measured).
 */
export const C = {
  white: '#ffffff',
  offWhite: '#fdfdfd',
  installerBg: '#e1d7c8',
  installerInk: '#1b1a18',
  installerMuted: '#6f6960',
  panelBeige: '#ded4c4',
  paper: '#faf7f1',
  ink: '#101114',
  black: '#000000',
  dark: '#0d1117',
  darkPanel: '#161b22',
  claudeOrange: '#d97757',
  claudeOrangeSoft: '#e8a488',
  salmon: '#f0a99a',
  supabaseGreen: '#3ecf8e',
  context7Green: '#009d6c',
  hackRed: '#ff3b30',
  hackRedDim: '#7a1a17',
  captionShadow: 'rgba(0,0,0,0.45)',
} as const;

export const F = {
  sans: 'Inter, system-ui, sans-serif',
  serif: '"Playfair Display", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

/** The talking-head card is full-bleed with a ~100px top radius, measured at y=804. */
export const AVATAR_CARD = {
  top: 804,
  radius: 100,
} as const;
