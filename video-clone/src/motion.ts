import {interpolate} from 'remotion';

/**
 * Camera motion in the source is almost entirely absent: every b-roll element
 * snaps to a box within the first ~20 frames of its shot and then holds
 * perfectly still until the cut. Tracking the elements frame by frame
 * (`tools/track_motion.py`) gives, for example:
 *
 *   consoleErrors  f314..f361  x=66..645  y=218..579   (unchanged, 48 frames)
 *   openBrowser    f170..f240  x=74..647  y=199..523   (unchanged, 71 frames)
 *   rampBroll      f1008..1085 x=73..647  y=181..486   (unchanged, 78 frames)
 *
 * So scenes must *settle and lock*, never drift. `settle` is the only easing
 * used for framing: it runs once over `frames` and is exactly 1 afterwards.
 */
export const settle = (frame: number, frames = 18) =>
  interpolate(frame, [0, frames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

/** A measured on-screen box, in frame pixels. */
export type Box = {x: number; y: number; w: number; h: number};

/** Absolute-position style for a measured box. */
export const box = (b: Box): React.CSSProperties => ({
  position: 'absolute',
  left: b.x,
  top: b.y,
  width: b.w,
  height: b.h,
});

/**
 * Entrance for a locked element: a small scale/offset that resolves to exactly
 * the measured box. `t` should come from `settle`.
 */
export const enter = (t: number, fromScale = 1.06, fromY = 10) => ({
  transform: `translateY(${(1 - t) * fromY}px) scale(${1 + (1 - t) * (fromScale - 1)})`,
  opacity: interpolate(t, [0, 0.45], [0, 1], {extrapolateRight: 'clamp'}),
});
