import { createTestDb } from '../testing/nodeSqliteDb';
import {
  getLastTemperature,
  getTemperature,
  getTemperatureDates,
  getTemperaturesInRange,
  upsertTemperature,
} from './temperature';

describe('temperature repo', () => {
  it('saves a reading and reads it back', async () => {
    const db = await createTestDb();
    const saved = await upsertTemperature(
      db,
      '2026-11-01',
      { celsius: 36.55 },
      new Date('2026-11-01T05:00:00Z'),
    );
    expect(saved).toMatchObject({ celsius: 36.55, unusual: false, note: '' });
    expect(await getTemperature(db, '2026-11-01')).toEqual(saved);
  });

  it('one reading per date: saving again replaces it, including the unusual flag', async () => {
    const db = await createTestDb();
    await upsertTemperature(db, '2026-11-01', { celsius: 36.4 });
    await upsertTemperature(db, '2026-11-01', { celsius: 37.1, unusual: true, note: 'sick' });
    expect(await getTemperature(db, '2026-11-01')).toMatchObject({
      celsius: 37.1,
      unusual: true,
      note: 'sick',
    });
    expect(await getTemperatureDates(db)).toEqual(['2026-11-01']);
  });

  it('the last reading is the latest by date, not by when it was saved', async () => {
    const db = await createTestDb();
    await upsertTemperature(db, '2026-11-03', { celsius: 36.6 });
    await upsertTemperature(db, '2026-11-01', { celsius: 36.3 }); // saved later, but older date
    expect((await getLastTemperature(db))?.date).toBe('2026-11-03');
  });

  it('the last reading is null when nothing was saved', async () => {
    expect(await getLastTemperature(await createTestDb())).toBeNull();
  });

  it('range is inclusive and ordered', async () => {
    const db = await createTestDb();
    for (const [d, c] of [
      ['2026-11-03', 36.6],
      ['2026-11-01', 36.4],
      ['2026-11-02', 36.5],
      ['2026-11-09', 36.7],
    ] as const) {
      await upsertTemperature(db, d, { celsius: c });
    }
    expect(
      (await getTemperaturesInRange(db, '2026-11-01', '2026-11-03')).map((r) => r.date),
    ).toEqual(['2026-11-01', '2026-11-02', '2026-11-03']);
  });

  it('the database refuses an impossible temperature', async () => {
    const db = await createTestDb();
    await expect(upsertTemperature(db, '2026-11-01', { celsius: 50 })).rejects.toThrow();
  });
});
