import { phaseForCycleDay } from './calendar';
import { addDays, diffInDays, parseLocalDate, toLocalDateString } from './dates';
import type { Phase } from './phase';

export interface CycleInput {
  startDate: string;
  endDate: string | null; // null: the latest cycle, still open
}

export interface CycleSummary {
  startDate: string;
  /** Last day of the cycle; null while it is still open. */
  endDate: string | null;
  open: boolean;
  /** Length in days (closed cycles); for the open cycle, the days so far. */
  days: number;
  /** Days with bleeding at the start of the cycle, from the day logs; null if nothing was logged. */
  periodDays: number | null;
  /** How many days of the cycle fall in each phase (for the coloured bar). */
  phaseDays: Record<Phase, number>;
}

const DEFAULT_CYCLE = 28;

/** Consecutive days from the start with flow above 0; null when none were logged. */
function bleedingDays(
  start: string,
  limit: number,
  flowByDate: ReadonlyMap<string, number | null>,
): number | null {
  let n = 0;
  for (let i = 0; i < limit; i++) {
    const date = toLocalDateString(addDays(parseLocalDate(start), i));
    const flow = flowByDate.get(date);
    if (flow !== null && flow !== undefined && flow > 0) n += 1;
    else break;
  }
  return n > 0 ? n : null;
}

/** Summary of one cycle for the history list. */
export function summarizeCycle(
  cycle: CycleInput,
  logs: readonly { date: string; flow: number | null }[],
  today: string,
): CycleSummary {
  const open = cycle.endDate === null;
  const start = parseLocalDate(cycle.startDate);
  const days = open
    ? diffInDays(parseLocalDate(today), start) + 1
    : diffInDays(parseLocalDate(cycle.endDate as string), start) + 1;
  // Phases are worked out for the cycle's length; an open cycle is assumed to be 28 days, and
  // days beyond that stay in the luteal phase (the period is late).
  const phaseLength = open ? DEFAULT_CYCLE : days;
  const phaseDays: Record<Phase, number> = { period: 0, follicular: 0, fertile: 0, luteal: 0 };
  for (let d = 1; d <= days; d++) phaseDays[phaseForCycleDay(d, phaseLength)] += 1;

  const flowByDate = new Map(logs.map((l) => [l.date, l.flow]));
  return {
    startDate: cycle.startDate,
    endDate: cycle.endDate,
    open,
    days,
    periodDays: bleedingDays(cycle.startDate, days, flowByDate),
    phaseDays,
  };
}
