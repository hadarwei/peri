import type { Db } from '../db/types';
import { getSetting, setSetting } from '../db/repos/settings';
import { SETTING_KEYS, parseSettings, serializeSetting, type TrackingSettings } from './tracking';

/** Reads every tracking setting from the on-device database. */
export async function loadTrackingSettings(db: Db): Promise<TrackingSettings> {
  const names = Object.keys(SETTING_KEYS) as (keyof TrackingSettings)[];
  const values = await Promise.all(names.map((n) => getSetting(db, SETTING_KEYS[n])));
  return parseSettings(Object.fromEntries(names.map((n, i) => [n, values[i]])));
}

/** Saves one tracking setting. */
export async function saveTrackingSetting<K extends keyof TrackingSettings>(
  db: Db,
  name: K,
  value: TrackingSettings[K],
): Promise<void> {
  await setSetting(db, SETTING_KEYS[name], serializeSetting(value));
}
