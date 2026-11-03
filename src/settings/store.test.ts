import { createTestDb } from '../db/testing/nodeSqliteDb';
import { loadTrackingSettings, saveTrackingSetting } from './store';
import { DEFAULT_SETTINGS } from './tracking';

describe('tracking settings store', () => {
  it('a fresh database gives the defaults', async () => {
    expect(await loadTrackingSettings(await createTestDb())).toEqual(DEFAULT_SETTINGS);
  });

  it('saves and reloads each kind of value', async () => {
    const db = await createTestDb();
    await saveTrackingSetting(db, 'tempEnabled', true);
    await saveTrackingSetting(db, 'reminderTime', '06:10');
    await saveTrackingSetting(db, 'reminderWindow', 'evening');
    await saveTrackingSetting(db, 'tempRemindersIgnoredCount', 2);
    expect(await loadTrackingSettings(db)).toMatchObject({
      tempEnabled: true,
      reminderTime: '06:10',
      reminderWindow: 'evening',
      tempRemindersIgnoredCount: 2,
    });
  });

  it('changing one setting leaves the others alone', async () => {
    const db = await createTestDb();
    await saveTrackingSetting(db, 'testsEnabled', true);
    await saveTrackingSetting(db, 'tempEnabled', true);
    await saveTrackingSetting(db, 'tempEnabled', false);
    expect(await loadTrackingSettings(db)).toMatchObject({
      testsEnabled: true,
      tempEnabled: false,
    });
  });
});
