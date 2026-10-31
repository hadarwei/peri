import { createTestDb } from '../testing/nodeSqliteDb';
import { countCycles, getCycles, getLatestCycle, startCycle } from './cycles';

describe('cycles repo', () => {
  it('starts the first cycle open and logged', async () => {
    const db = await createTestDb();
    const c = await startCycle(db, '2026-10-01');
    expect(c).toMatchObject({ startDate: '2026-10-01', endDate: null, source: 'logged' });
    expect(await countCycles(db)).toBe(1);
  });

  it('a new cycle closes the previous one the day before it starts', async () => {
    const db = await createTestDb();
    await startCycle(db, '2026-10-01');
    await startCycle(db, '2026-10-29');
    const cycles = await getCycles(db);
    expect(cycles.map((c) => [c.startDate, c.endDate])).toEqual([
      ['2026-10-01', '2026-10-28'],
      ['2026-10-29', null],
    ]);
    expect((await getLatestCycle(db))?.startDate).toBe('2026-10-29');
  });

  it('closing works across month and year boundaries', async () => {
    const db = await createTestDb();
    await startCycle(db, '2026-12-10');
    await startCycle(db, '2027-01-01');
    expect((await getCycles(db))[0].endDate).toBe('2026-12-31');
  });

  it('adding an older cycle later fixes the ends of the whole list', async () => {
    const db = await createTestDb();
    await startCycle(db, '2026-10-29');
    await startCycle(db, '2026-10-01', 'imported');
    const cycles = await getCycles(db);
    expect(cycles.map((c) => [c.startDate, c.endDate, c.source])).toEqual([
      ['2026-10-01', '2026-10-28', 'imported'],
      ['2026-10-29', null, 'logged'],
    ]);
  });

  it('starting on a date that already starts a cycle adds nothing', async () => {
    const db = await createTestDb();
    await startCycle(db, '2026-10-01');
    await startCycle(db, '2026-10-01');
    expect(await countCycles(db)).toBe(1);
  });

  it('latest cycle is null when there are none', async () => {
    expect(await getLatestCycle(await createTestDb())).toBeNull();
  });
});
