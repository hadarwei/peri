import type { DuckFrame } from '../assets/duckFrames';

/** Size of the walk/dance/stand pictures, and of the resting picture. */
export const FRAME_W = 260;
export const FRAME_H = 250;
export const REST_W = 491;
export const REST_H = 249;
/** The resting duck is drawn at half the height of the standing one so they look the same size. */
export const REST_SCALE = 0.5;

export interface Anchors {
  /** Top of the head, centre (picture units). Hats and crowns sit here. */
  head: { x: number; y: number };
  /** A point on the back (the left side, the duck faces right). Backpack goes here. */
  back: { x: number; y: number };
}

/** Measured from the transparent pixels of each picture (the highest opaque row). */
export const ANCHORS: Partial<Record<DuckFrame, Anchors>> = {
  stand: { head: { x: 151, y: 88 }, back: { x: 80, y: 178 } },
  walk1: { head: { x: 153, y: 100 }, back: { x: 78, y: 185 } },
  walk2: { head: { x: 152, y: 100 }, back: { x: 79, y: 185 } },
  walk3: { head: { x: 158, y: 103 }, back: { x: 76, y: 186 } },
  dance1: { head: { x: 162, y: 101 }, back: { x: 81, y: 185 } },
  dance2: { head: { x: 145, y: 98 }, back: { x: 71, y: 184 } },
  dance3: { head: { x: 134, y: 98 }, back: { x: 80, y: 184 } },
};

/** Head of the lying-down duck in the resting picture (it faces left). */
export const REST_HEAD = { x: 125, y: 125 };
