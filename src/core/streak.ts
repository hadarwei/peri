import { addDays, parseLocalDate, toLocalDateString } from './dates';

/**
 * Days in a row with a check-in, counted back from today.
 * Any check-in counts (including just opening the app). If today has no check-in yet, the streak
 * is still alive through yesterday; it only breaks when a whole day is missed.
 * `dates` are 'YYYY-MM-DD', in any order, duplicates allowed; future dates are ignored.
 */
export function calculateStreak(dates: readonly string[], today: string): number {
  const days = new Set(dates.filter((d) => d <= today));
  const yesterday = toLocalDateString(addDays(parseLocalDate(today), -1));

  let cursor: string;
  if (days.has(today)) cursor = today;
  else if (days.has(yesterday)) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = toLocalDateString(addDays(parseLocalDate(cursor), -1));
  }
  return streak;
}
