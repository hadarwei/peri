import type { DayLogPatch } from './repos/dayLogs';
import { getDayLog, upsertDayLog } from './repos/dayLogs';
import { recordCheckin } from './repos/checkins';
import type { Db } from './types';

/**
 * Saves a check-in: the day's log and the fact that the user checked in, in one transaction.
 * If nothing was entered and there is no log yet, no empty log is written, but the check-in
 * still counts (for the streak).
 */
export async function saveCheckIn(
  db: Db,
  date: string,
  patch: DayLogPatch,
  hasContent: boolean,
  now: Date = new Date(),
): Promise<void> {
  await db.withTransactionAsync(async () => {
    const existing = await getDayLog(db, date);
    if (hasContent || existing) await upsertDayLog(db, date, patch, now);
    await recordCheckin(db, date);
  });
}
