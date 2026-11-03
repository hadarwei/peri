import { recordCheckin } from './repos/checkins';
import type { DayLogPatch } from './repos/dayLogs';
import { getDayLog, upsertDayLog } from './repos/dayLogs';
import { upsertTemperature } from './repos/temperature';
import type { Db } from './types';

export interface CheckInInput {
  /** What to change in the day's log. */
  patch: DayLogPatch;
  /** Something was entered (a field, or a temperature). Without it, no empty log is written. */
  hasContent: boolean;
  /** False when filling in a past day, so back-filling cannot extend the streak. */
  countsForStreak: boolean;
  /** Morning temperature, when the user entered one. */
  temperature?: { celsius: number; unusual: boolean } | null;
  now?: Date;
}

/**
 * Saves a check-in in one transaction: the day's log, the temperature (if any) and the fact that
 * the user checked in. If nothing was entered and there is no log yet, no empty log is written,
 * but the check-in still counts for the streak.
 */
export async function saveCheckIn(db: Db, date: string, input: CheckInInput): Promise<void> {
  const now = input.now ?? new Date();
  await db.withTransactionAsync(async () => {
    const existing = await getDayLog(db, date);
    const hasLogContent = Object.values(input.patch).some(
      (v) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0) && v !== '',
    );
    if ((input.hasContent && hasLogContent) || existing)
      await upsertDayLog(db, date, input.patch, now);
    if (input.temperature) await upsertTemperature(db, date, input.temperature, now);
    if (input.countsForStreak) await recordCheckin(db, date);
  });
}
