import { createTestDb } from './testing/nodeSqliteDb';
import { getCheckinDates, getDayLog } from './repos';
import { saveCheckIn } from './saveCheckIn';

describe('saveCheckIn', () => {
  it('saves the log and records the check-in', async () => {
    const db = await createTestDb();
    await saveCheckIn(db, '2026-11-01', { mood: 4, symptoms: ['a'] }, true);
    expect(await getDayLog(db, '2026-11-01')).toMatchObject({ mood: 4, symptoms: ['a'] });
    expect(await getCheckinDates(db)).toEqual(['2026-11-01']);
  });

  it('checking in twice on one day keeps one check-in and updates the log', async () => {
    const db = await createTestDb();
    await saveCheckIn(db, '2026-11-01', { mood: 2 }, true);
    await saveCheckIn(db, '2026-11-01', { mood: 5 }, true);
    expect((await getDayLog(db, '2026-11-01'))?.mood).toBe(5);
    expect(await getCheckinDates(db)).toEqual(['2026-11-01']);
  });

  it('an empty check-in counts for the streak but writes no empty log', async () => {
    const db = await createTestDb();
    await saveCheckIn(db, '2026-11-01', {}, false);
    expect(await getDayLog(db, '2026-11-01')).toBeNull();
    expect(await getCheckinDates(db)).toEqual(['2026-11-01']);
  });

  it('rolls back everything when the log is invalid', async () => {
    const db = await createTestDb();
    await expect(saveCheckIn(db, '2026-11-01', { mood: 9 }, true)).rejects.toThrow();
    expect(await getCheckinDates(db)).toEqual([]);
  });
});
