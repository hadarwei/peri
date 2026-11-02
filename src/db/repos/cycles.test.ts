import { createTestDb } from '../testing/nodeSqliteDb';
import {
  countCycles,
  deleteCycle,
  getCycles,
  getLatestCycle,
  startCycle,
  updateCycleStart,
} from './cycles';

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

  describe('edit and delete', () => {
    const seed = async () => {
      const db = await createTestDb();
      await startCycle(db, '2026-09-01');
      await startCycle(db, '2026-09-29');
      await startCycle(db, '2026-10-27');
      return db;
    };
    const summary = async (db: Awaited<ReturnType<typeof seed>>) =>
      (await getCycles(db)).map((c) => [c.startDate, c.endDate]);

    it('deleting a middle cycle makes the previous one run until the next start', async () => {
      const db = await seed();
      const middle = (await getCycles(db))[1];
      await deleteCycle(db, middle.id);
      expect(await summary(db)).toEqual([
        ['2026-09-01', '2026-10-26'],
        ['2026-10-27', null],
      ]);
    });

    it('deleting the latest cycle reopens the one before it', async () => {
      const db = await seed();
      const latest = await getLatestCycle(db);
      await deleteCycle(db, latest!.id);
      expect(await summary(db)).toEqual([
        ['2026-09-01', '2026-09-28'],
        ['2026-09-29', null],
      ]);
    });

    it('deleting the only cycle leaves none', async () => {
      const db = await createTestDb();
      const c = await startCycle(db, '2026-09-01');
      await deleteCycle(db, c.id);
      expect(await countCycles(db)).toBe(0);
    });

    it('changing a start date re-closes the neighbours', async () => {
      const db = await seed();
      const middle = (await getCycles(db))[1];
      expect(await updateCycleStart(db, middle.id, '2026-10-02')).toBe(true);
      expect(await summary(db)).toEqual([
        ['2026-09-01', '2026-10-01'],
        ['2026-10-02', '2026-10-26'],
        ['2026-10-27', null],
      ]);
    });

    it('moving a cycle past another keeps the list in date order', async () => {
      const db = await seed();
      const first = (await getCycles(db))[0];
      await updateCycleStart(db, first.id, '2026-11-10');
      expect((await getCycles(db)).map((c) => c.startDate)).toEqual([
        '2026-09-29',
        '2026-10-27',
        '2026-11-10',
      ]);
    });

    it('updating an id that does not exist changes nothing and says so', async () => {
      const db = await seed();
      expect(await updateCycleStart(db, 9999, '2026-01-01')).toBe(false);
      expect(await countCycles(db)).toBe(3);
    });

    it('refuses to move a cycle onto another cycle start date', async () => {
      const db = await seed();
      const first = (await getCycles(db))[0];
      await expect(updateCycleStart(db, first.id, '2026-09-29')).rejects.toThrow();
      expect((await getCycles(db)).map((c) => c.startDate)).toEqual([
        '2026-09-01',
        '2026-09-29',
        '2026-10-27',
      ]);
    });
  });
});
