import { createTestDb } from './testing/nodeSqliteDb';
import { getCheckinDates, getDayLog, getTemperature } from './repos';
import { saveCheckIn } from './saveCheckIn';

const base = { hasContent: true, countsForStreak: true };

describe('saveCheckIn', () => {
  it('saves the log and records the check-in', async () => {
    const db = await createTestDb();
    await saveCheckIn(db, '2026-11-01', { ...base, patch: { mood: 4, symptoms: ['a'] } });
    expect(await getDayLog(db, '2026-11-01')).toMatchObject({ mood: 4, symptoms: ['a'] });
    expect(await getCheckinDates(db)).toEqual(['2026-11-01']);
  });

  it('checking in twice on one day keeps one check-in and updates the log', async () => {
    const db = await createTestDb();
    await saveCheckIn(db, '2026-11-01', { ...base, patch: { mood: 2 } });
    await saveCheckIn(db, '2026-11-01', { ...base, patch: { mood: 5 } });
    expect((await getDayLog(db, '2026-11-01'))?.mood).toBe(5);
    expect(await getCheckinDates(db)).toEqual(['2026-11-01']);
  });

  it('an empty check-in counts for the streak but writes no empty log', async () => {
    const db = await createTestDb();
    await saveCheckIn(db, '2026-11-01', { ...base, hasContent: false, patch: {} });
    expect(await getDayLog(db, '2026-11-01')).toBeNull();
    expect(await getCheckinDates(db)).toEqual(['2026-11-01']);
  });

  it('rolls back everything when the log is invalid', async () => {
    const db = await createTestDb();
    await expect(saveCheckIn(db, '2026-11-01', { ...base, patch: { mood: 9 } })).rejects.toThrow();
    expect(await getCheckinDates(db)).toEqual([]);
  });

  it('filling in a past day saves the log but does not count for the streak', async () => {
    const db = await createTestDb();
    await saveCheckIn(db, '2026-10-01', { ...base, countsForStreak: false, patch: { mood: 3 } });
    expect(await getDayLog(db, '2026-10-01')).toMatchObject({ mood: 3 });
    expect(await getCheckinDates(db)).toEqual([]);
  });

  describe('temperature', () => {
    it('saves a temperature together with the log', async () => {
      const db = await createTestDb();
      await saveCheckIn(db, '2026-11-01', {
        ...base,
        patch: { mood: 3 },
        temperature: { celsius: 36.55, unusual: true },
      });
      expect(await getTemperature(db, '2026-11-01')).toMatchObject({
        celsius: 36.55,
        unusual: true,
      });
      expect((await getDayLog(db, '2026-11-01'))?.mood).toBe(3);
    });

    it('a temperature alone saves no empty day log', async () => {
      const db = await createTestDb();
      await saveCheckIn(db, '2026-11-01', {
        ...base,
        patch: { mood: null, symptoms: [], note: '' },
        temperature: { celsius: 36.4, unusual: false },
      });
      expect(await getDayLog(db, '2026-11-01')).toBeNull();
      expect(await getTemperature(db, '2026-11-01')).toMatchObject({ celsius: 36.4 });
      expect(await getCheckinDates(db)).toEqual(['2026-11-01']);
    });

    it('rolls the temperature back with the rest when something fails', async () => {
      const db = await createTestDb();
      await expect(
        saveCheckIn(db, '2026-11-01', {
          ...base,
          patch: { mood: 9 },
          temperature: { celsius: 36.4, unusual: false },
        }),
      ).rejects.toThrow();
      expect(await getTemperature(db, '2026-11-01')).toBeNull();
    });
  });
});
