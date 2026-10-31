import type { Db } from '../types';

/** Records that the user checked in on `date`. Safe to call many times for the same day. */
export async function recordCheckin(db: Db, date: string): Promise<void> {
  await db.runAsync('INSERT OR IGNORE INTO checkins (date) VALUES (?)', [date]);
}

/** All check-in dates, oldest first. */
export async function getCheckinDates(db: Db): Promise<string[]> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM checkins ORDER BY date ASC',
  );
  return rows.map((r) => r.date);
}
