import { summarizeCycle } from '../core/history';
import { getDayLog, getDayLogsInRange, upsertDayLog } from './repos';
import { setPeriodDays } from './periodDays';
import { createTestDb } from './testing/nodeSqliteDb';

describe('setPeriodDays', () => {
  it('gives each of the days a bleeding level', async () => {
    const db = await createTestDb();
    await setPeriodDays(db, '2026-10-01', 4, 3);
    const logs = await getDayLogsInRange(db, '2026-10-01', '2026-10-10');
    expect(logs.map((l) => [l.date, l.flow])).toEqual([
      ['2026-10-01', 3],
      ['2026-10-02', 3],
      ['2026-10-03', 3],
      ['2026-10-04', 3],
    ]);
  });

  it('keeps what was already logged on those days', async () => {
    const db = await createTestDb();
    await upsertDayLog(db, '2026-10-02', { mood: 4, note: 'hi' });
    await setPeriodDays(db, '2026-10-01', 3);
    expect(await getDayLog(db, '2026-10-02')).toMatchObject({ mood: 4, note: 'hi', flow: 2 });
  });

  it('a shorter period clears the bleeding on the extra days only', async () => {
    const db = await createTestDb();
    await setPeriodDays(db, '2026-10-01', 6);
    await upsertDayLog(db, '2026-10-05', { mood: 2 });
    await setPeriodDays(db, '2026-10-01', 3);
    expect((await getDayLog(db, '2026-10-03'))?.flow).toBe(2);
    expect((await getDayLog(db, '2026-10-04'))?.flow).toBeNull();
    expect((await getDayLog(db, '2026-10-05'))?.flow).toBeNull();
    expect((await getDayLog(db, '2026-10-05'))?.mood).toBe(2); // other data stays
  });

  it('feeds the cycle history: the card then shows the bleeding length', async () => {
    const db = await createTestDb();
    await setPeriodDays(db, '2026-10-01', 5);
    const logs = await getDayLogsInRange(db, '2026-10-01', '2026-10-28');
    const s = summarizeCycle(
      { startDate: '2026-10-01', endDate: '2026-10-28' },
      logs,
      '2026-11-03',
    );
    expect(s.periodDays).toBe(5);
  });
});
