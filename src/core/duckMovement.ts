// Pure movement rules for the duck. A position is where the duck's FEET are (bottom centre of its
// box) inside the 310 px high meadow, as in the design: box 104x100, feet band y 215-298.

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// The design box is 104x100; shown at 80% because it felt too big on a real phone.
export const DUCK_H = 80;
export const DUCK_W = (DUCK_H * 260) / 250; // frames are 260x250
export const FEET_MIN_Y = 215;
export const FEET_MAX_Y = 298;
export const EDGE_MARGIN = 55;
export const SPEED_PX_PER_S = 75;
export const MIN_SCALE = 0.85;
export const MAX_SCALE = 1.12;
export const WANDER_MIN_MS = 2500;
export const WANDER_MAX_MS = 5500;

export function clampToBounds(p: Point, b: Bounds): Point {
  return {
    x: Math.min(Math.max(p.x, b.minX), b.maxX),
    y: Math.min(Math.max(p.y, b.minY), b.maxY),
  };
}

/** Random point inside the bounds. `rng` returns a number in [0, 1). */
export function randomPoint(b: Bounds, rng: () => number = Math.random): Point {
  return {
    x: b.minX + rng() * (b.maxX - b.minX),
    y: b.minY + rng() * (b.maxY - b.minY),
  };
}

/** Time to walk a straight line at the constant walking speed. */
export function walkDurationMs(from: Point, to: Point): number {
  return (Math.hypot(to.x - from.x, to.y - from.y) / SPEED_PX_PER_S) * 1000;
}

/** Frames face right, so the duck is mirrored when it walks left. Keeps the old side if no x change. */
export function facingScaleX(from: Point, to: Point, current: 1 | -1): 1 | -1 {
  if (to.x > from.x) return 1;
  if (to.x < from.x) return -1;
  return current;
}

/** Perspective: the lower on screen, the closer and bigger (0.85 at the top, 1.12 at the bottom). */
export function depthScale(y: number, b: Bounds): number {
  'worklet'; // called from an animated style, i.e. on the UI thread
  if (b.maxY === b.minY) return 1;
  const t = Math.min(Math.max((y - b.minY) / (b.maxY - b.minY), 0), 1);
  return MIN_SCALE + t * (MAX_SCALE - MIN_SCALE);
}

/** Pause before the next wander, 2.5 to 5.5 seconds. */
export function nextWanderDelayMs(rng: () => number = Math.random): number {
  return WANDER_MIN_MS + rng() * (WANDER_MAX_MS - WANDER_MIN_MS);
}

/** Where the duck's feet may be for a scene of the given width (the lower part of the meadow). */
export function walkableBounds(sceneWidth: number): Bounds {
  return {
    minX: EDGE_MARGIN,
    maxX: sceneWidth - EDGE_MARGIN,
    minY: FEET_MIN_Y,
    maxY: FEET_MAX_Y,
  };
}
