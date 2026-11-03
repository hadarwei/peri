import { addDays, parseLocalDate, toLocalDateString } from '../core/dates';
import { getDayLog, upsertDayLog } from './repos/dayLogs';
import type { Db } from './types';

const nthDay = (start: string, n: number) => toLocalDateString(addDays(parseLocalDate(start), n));

/**
 * Records that the period lasted `days` days from `startDate` by giving each of those days a
 * bleeding level (`flow` 1-3). Other things logged on those days are kept. If bleeding was logged
 * on the days right after, they are cleared, so a shorter period really becomes shorter.
 */
export async function setPeriodDays(
  db: Db,
  startDate: string,
  days: number,
  flow: 1 | 2 | 3 = 2,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < days; i++) await upsertDayLog(db, nthDay(startDate, i), { flow });
    for (let i = days; i < days + 15; i++) {
      const log = await getDayLog(db, nthDay(startDate, i));
      if (!log || log.flow === null || log.flow === 0) break;
      await upsertDayLog(db, nthDay(startDate, i), { flow: null });
    }
  });
}
