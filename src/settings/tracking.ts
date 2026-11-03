/** Settings for what the user chooses to track, with safe defaults and strict parsing. */

export type ReminderWindow = 'morning' | 'evening';

export interface TrackingSettings {
  /** Body temperature tracking is on. */
  tempEnabled: boolean;
  /** Measure every day, not only in the fertile window. */
  tempDaily: boolean;
  /** Reminder time of day, 'HH:MM' (24 hours). */
  reminderTime: string;
  /** Morning or evening measurement; decides the default time and the planner's window. */
  reminderWindow: ReminderWindow;
  /** The reminder is switched on (needs notification permission). */
  reminderEnabled: boolean;
  /** LH test photo tracking is on. */
  testsEnabled: boolean;
  /** Manual pregnancy mode. */
  pregnancyMode: boolean;
  /** Reminders in a row that were not followed by a logged temperature. */
  tempRemindersIgnoredCount: number;
}

export const SETTING_KEYS = {
  tempEnabled: 'temperature_enabled',
  tempDaily: 'temperature_daily',
  reminderTime: 'reminder_time',
  reminderWindow: 'reminder_window',
  reminderEnabled: 'reminder_enabled',
  testsEnabled: 'tests_enabled',
  pregnancyMode: 'pregnancy_mode',
  tempRemindersIgnoredCount: 'temp_reminders_ignored_count',
} as const satisfies Record<keyof TrackingSettings, string>;

export const DEFAULT_REMINDER_TIME: Record<ReminderWindow, string> = {
  morning: '07:30',
  evening: '21:00',
};

export const DEFAULT_SETTINGS: TrackingSettings = {
  tempEnabled: false,
  tempDaily: false,
  reminderTime: DEFAULT_REMINDER_TIME.morning,
  reminderWindow: 'morning',
  reminderEnabled: false,
  testsEnabled: false,
  pregnancyMode: false,
  tempRemindersIgnoredCount: 0,
};

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

const parseBool = (raw: string | null | undefined, fallback: boolean) =>
  raw === '1' ? true : raw === '0' ? false : fallback;

/** Turns the raw stored strings into settings. Anything missing or invalid becomes the default. */
export function parseSettings(
  raw: Partial<Record<keyof TrackingSettings, string | null>>,
): TrackingSettings {
  const d = DEFAULT_SETTINGS;
  const window: ReminderWindow =
    raw.reminderWindow === 'morning' || raw.reminderWindow === 'evening'
      ? raw.reminderWindow
      : d.reminderWindow;
  const time =
    raw.reminderTime && isValidTime(raw.reminderTime)
      ? raw.reminderTime
      : DEFAULT_REMINDER_TIME[window];
  const count = Number(raw.tempRemindersIgnoredCount);
  return {
    tempEnabled: parseBool(raw.tempEnabled, d.tempEnabled),
    tempDaily: parseBool(raw.tempDaily, d.tempDaily),
    reminderTime: time,
    reminderWindow: window,
    reminderEnabled: parseBool(raw.reminderEnabled, d.reminderEnabled),
    testsEnabled: parseBool(raw.testsEnabled, d.testsEnabled),
    pregnancyMode: parseBool(raw.pregnancyMode, d.pregnancyMode),
    tempRemindersIgnoredCount: Number.isInteger(count) && count >= 0 ? count : 0,
  };
}

/** The string stored for one setting value. */
export function serializeSetting(value: boolean | number | string): string {
  return typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
}
