import { blend } from '../core/color';
import type { Phase } from '../core/phase';

/**
 * Colours for days that really happened (vivid) and for predicted days (mostly gray).
 * Used by the calendar, its legend and the cycle strip on the Today screen, so they all agree.
 */
export const REAL_PHASE_COLOR: Record<Phase, string> = {
  period: '#FFA3BB',
  follicular: '#9CC4FF',
  fertile: '#7ED9B8',
  luteal: '#C3B4EE',
};

const PREDICTED_GRAY = '#D5D9DF';
const PREDICTED_MIX = 0.82; // 0 = full colour, 1 = pure gray

export const PREDICTED_DASH = '#BCC4CF';
export const PREDICTED_SWATCH = PREDICTED_GRAY;

/** A predicted day's colour: the phase colour almost fully washed out to gray. */
export function predictedPhaseColor(phase: Phase): string {
  return blend(REAL_PHASE_COLOR[phase], PREDICTED_GRAY, PREDICTED_MIX);
}
