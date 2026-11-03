import { diffInDays, parseLocalDate } from './dates';
import { simplePrediction } from './simplePrediction';

/** Range around a prediction until real ranges arrive in stage 6 (the spec's default is ±4 days). */
export const DEFAULT_RANGE_DAYS = 4;

export interface TodayCycle {
  /** Today's day in the cycle, 1-based (can pass 28 when the period is late). */
  dayOfCycle: number;
  /** Days from today to the predicted next period start; zero or negative when it is today or late. */
  daysToPeriod: number;
  /** Days from today to the estimated ovulation; zero or negative when it is today or has passed. */
  daysToOvulation: number;
}

/** What the Today screen shows, from the latest period start (stand-in prediction until stage 6). */
export function todayCycle(lastPeriodStart: string, today: string): TodayCycle {
  const prediction = simplePrediction(lastPeriodStart);
  const now = parseLocalDate(today);
  return {
    dayOfCycle: diffInDays(now, parseLocalDate(lastPeriodStart)) + 1,
    daysToPeriod: diffInDays(parseLocalDate(prediction.predictedPeriodStart), now),
    daysToOvulation: diffInDays(parseLocalDate(prediction.ovulation), now),
  };
}
