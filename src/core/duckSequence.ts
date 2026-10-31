import type { DuckFrame } from '../assets/duckFrames';

export type DuckMode = 'idle' | 'walk' | 'dance';

/** Frame order for each animation. Walk and dance both go 1, 2, 3, 2 so the loop is smooth. */
export const DUCK_SEQUENCES: Record<DuckMode, readonly DuckFrame[]> = {
  idle: ['stand'],
  walk: ['walk1', 'walk2', 'walk3', 'walk2'],
  dance: ['dance1', 'dance2', 'dance3', 'dance2'],
};

export const FRAME_MS = 150;

/**
 * Which frame is visible for a looping `progress` value (0 up to sequence length, repeating).
 * Marked as a worklet so Reanimated can run it on the UI thread.
 */
export function frameForProgress(sequence: readonly DuckFrame[], progress: number): DuckFrame {
  'worklet';
  const index = Math.min(Math.floor(progress), sequence.length - 1);
  return sequence[Math.max(index, 0)];
}
