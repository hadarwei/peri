import { createTestDb } from '../testing/nodeSqliteDb';
import { countDayLogs, getDayLog, getDayLogsInRange, upsertDayLog } from './dayLogs';
import { getSetting, setSetting } from './settings';

describe('dayLogs repo', () => {
  it('returns null for a missing day', async () => {
    const db = await createTestDb();
    expect(await getDayLog(db, '2026-01-01')).toBeNull();
  });

  it('creates a log with defaults and reads it back', async () => {
    const db = await createTestDb();
    const saved = await upsertDayLog(
      db,
      '2026-01-01',
      { mood: 4 },
      new Date('2026-01-01T08:00:00Z'),
    );
    expect(saved).toMatchObject({
      date: '2026-01-01',
      mood: 4,
      flow: null,
      symptoms: [],
      note: '',
    });
    expect(await getDayLog(db, '2026-01-01')).toEqual(saved);
  });

  it('upsert merges: unspecified fields are kept, null clears', async () => {
    const db = await createTestDb();
    await upsertDayLog(db, '2026-01-01', { mood: 4, pain: 3, symptoms: ['headache'], note: 'hi' });
    await upsertDayLog(db, '2026-01-01', { pain: 5 });
    expect(await getDayLog(db, '2026-01-01')).toMatchObject({
      mood: 4,
      pain: 5,
      symptoms: ['headache'],
      note: 'hi',
    });
    await upsertDayLog(db, '2026-01-01', { mood: null });
    expect((await getDayLog(db, '2026-01-01'))?.mood).toBeNull();
    expect(await countDayLogs(db)).toBe(1);
  });

  it('stores Hebrew symptoms and notes intact', async () => {
    const db = await createTestDb();
    await upsertDayLog(db, '2026-01-02', { symptoms: ['כאב ראש', 'עייפות'], note: 'יום קשה' });
    expect(await getDayLog(db, '2026-01-02')).toMatchObject({
      symptoms: ['כאב ראש', 'עייפות'],
      note: 'יום קשה',
    });
  });

  it('range query is inclusive and ordered', async () => {
    const db = await createTestDb();
    for (const d of ['2026-01-03', '2026-01-01', '2026-01-02', '2026-01-09']) {
      await upsertDayLog(db, d, { mood: 3 });
    }
    const rows = await getDayLogsInRange(db, '2026-01-01', '2026-01-03');
    expect(rows.map((r) => r.date)).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
  });

  it('the database rejects out-of-range values', async () => {
    const db = await createTestDb();
    await expect(upsertDayLog(db, '2026-01-01', { mood: 9 })).rejects.toThrow();
  });
});

describe('settings repo', () => {
  it('returns null when unset, stores and overwrites', async () => {
    const db = await createTestDb();
    expect(await getSetting(db, 'name')).toBeNull();
    await setSetting(db, 'name', 'הדר');
    expect(await getSetting(db, 'name')).toBe('הדר');
    await setSetting(db, 'name', 'x');
    expect(await getSetting(db, 'name')).toBe('x');
  });
});
