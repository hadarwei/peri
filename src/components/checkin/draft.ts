/** What the user has entered so far in the check-in (nothing is required). */
export interface CheckInDraft {
  mood: number | null; // 1-5
  symptoms: string[];
  flow: number | null; // 0-3
  pain: number | null; // 0-10
  energy: number | null; // 1-5
  note: string;
  /** Morning temperature; null until the user presses + or - (so a guess is never saved). */
  temperature: number | null;
  temperatureUnusual: boolean;
}

export const EMPTY_DRAFT: CheckInDraft = {
  mood: null,
  symptoms: [],
  flow: null,
  pain: null,
  energy: null,
  note: '',
  temperature: null,
  temperatureUnusual: false,
};

/** Pain is chosen from four levels; these are the values stored for them. */
export const PAIN_VALUES = [0, 3, 6, 9];

/** Adds the symptom if missing, removes it if present. */
export function toggleSymptom(symptoms: string[], symptom: string): string[] {
  return symptoms.includes(symptom)
    ? symptoms.filter((s) => s !== symptom)
    : [...symptoms, symptom];
}

interface LogLike {
  mood: number | null;
  symptoms: string[];
  flow: number | null;
  pain: number | null;
  energy: number | null;
  note: string;
}

/** A draft that starts from an already saved day log. */
export function draftFromLog(log: LogLike): CheckInDraft {
  return {
    ...EMPTY_DRAFT,
    mood: log.mood,
    symptoms: [...log.symptoms],
    flow: log.flow,
    pain: log.pain,
    energy: log.energy,
    note: log.note,
  };
}

/** "Same as yesterday": copies how yesterday felt, but not the free-text note. */
export function draftFromYesterday(yesterday: LogLike): CheckInDraft {
  return { ...draftFromLog(yesterday), note: '' };
}

export function isDraftEmpty(d: CheckInDraft): boolean {
  return (
    d.mood === null &&
    d.symptoms.length === 0 &&
    d.flow === null &&
    d.pain === null &&
    d.energy === null &&
    d.note.trim() === '' &&
    d.temperature === null
  );
}
