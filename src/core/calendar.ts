import { addDays, diffInDays, parseLocalDate, toLocalDateString } from './dates';
import type { Phase } from './phase';

export interface GridCell {
  /** 'YYYY-MM-DD'. */
  date: string;
  /** Belongs to the shown month (the other cells are padding from the neighbouring months). */
  inMonth: boolean;
}

/** Weeks of the month, Sunday first, padded with days of the neighbouring months. */
export function monthGrid(year: number, month: number): GridCell[][] {
  // month is 1-12
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leading = first.getDay(); // 0 = Sunday
  const rows = Math.ceil((leading + daysInMonth) / 7);
  const start = addDays(first, -leading);
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      const d = addDays(start, r * 7 + c);
      return { date: toLocalDateString(d), inMonth: d.getMonth() === month - 1 };
    }),
  );
}

/** Previous or next month, wrapping the year. `delta` is -1 or +1. */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export const PERIOD_DAYS = 5; // stand-in until real period lengths are used
const DEFAULT_CYCLE = 28;
const LUTEAL_DAYS = 14;
const FERTILE_DAYS = 5;

/**
 * Phase of a day in a cycle of `cycleLength` days (1-based `day`):
 * period first, then follicular, the fertile window (5 days up to ovulation, which is estimated
 * 14 days before the next period), then luteal. Days past the cycle length stay luteal.
 */
export function phaseForCycleDay(day: number, cycleLength: number): Phase {
  if (day <= PERIOD_DAYS) return 'period';
  const ovulation = cycleLength - LUTEAL_DAYS;
  const fertileStart = Math.max(PERIOD_DAYS + 1, ovulation - FERTILE_DAYS);
  if (day > ovulation) return 'luteal';
  if (day >= fertileStart) return 'fertile';
  return 'follicular';
}

export interface CycleSpan {
  startDate: string;
  endDate: string | null; // null: the latest cycle, still open
}

export interface DayInfo {
  /** Null before the first recorded cycle. */
  phase: Phase | null;
  cycleDay: number | null;
  /** A future day, so the phase is a prediction and not a record. */
  predicted: boolean;
}

/**
 * What the calendar shows for one day, from the recorded cycles. Closed cycles use their own
 * length. After the latest cycle starts, a 28 day cycle is assumed and repeats into the future
 * (a stand-in until stage 6 brings the real predictions).
 */
export function dayInfo(date: string, cycles: readonly CycleSpan[], today: string): DayInfo {
  const day = parseLocalDate(date);
  const sorted = [...cycles].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
  const containing = [...sorted].reverse().find((c) => c.startDate <= date);
  if (!containing) return { phase: null, cycleDay: null, predicted: false };

  const offset = diffInDays(day, parseLocalDate(containing.startDate));
  if (containing.endDate !== null) {
    const length =
      diffInDays(parseLocalDate(containing.endDate), parseLocalDate(containing.startDate)) + 1;
    return { phase: phaseForCycleDay(offset + 1, length), cycleDay: offset + 1, predicted: false };
  }

  // The open (latest) cycle.
  const predicted = date > today;
  const cycleDay = predicted ? (offset % DEFAULT_CYCLE) + 1 : offset + 1;
  return { phase: phaseForCycleDay(cycleDay, DEFAULT_CYCLE), cycleDay, predicted };
}
