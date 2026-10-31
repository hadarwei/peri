import { addDays, parseLocalDate, toLocalDateString } from './dates';

export const DEFAULT_CYCLE_LENGTH = 28;
export const LUTEAL_PHASE_DAYS = 14; // an estimate; it varies between people (to verify)
export const FERTILE_DAYS_BEFORE_OVULATION = 5;

export interface SimplePrediction {
  predictedPeriodStart: string;
  ovulation: string;
  fertileWindow: { start: string; end: string };
}

const shift = (date: string, days: number) =>
  toLocalDateString(addDays(parseLocalDate(date), days));

/**
 * A stand-in until stage 6: assumes a 28 day cycle counted from the latest period start.
 * Ovulation = next period minus 14 days (an estimate), fertile window = 5 days before it
 * through ovulation day. Stage 6 replaces this with the weighted average and ranges.
 */
export function simplePrediction(lastPeriodStart: string): SimplePrediction {
  const predictedPeriodStart = shift(lastPeriodStart, DEFAULT_CYCLE_LENGTH);
  const ovulation = shift(predictedPeriodStart, -LUTEAL_PHASE_DAYS);
  return {
    predictedPeriodStart,
    ovulation,
    fertileWindow: { start: shift(ovulation, -FERTILE_DAYS_BEFORE_OVULATION), end: ovulation },
  };
}
