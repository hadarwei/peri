/** What the user has entered so far in the check-in (nothing is required). */
export interface CheckInDraft {
  mood: number | null; // 1-5
  symptoms: string[];
  flow: number | null; // 0-3
  pain: number | null; // 0-10
  energy: number | null; // 1-5
  note: string;
}

export const EMPTY_DRAFT: CheckInDraft = {
  mood: null,
  symptoms: [],
  flow: null,
  pain: null,
  energy: null,
  note: '',
};

/** Pain is chosen from four levels; these are the values stored for them. */
export const PAIN_VALUES = [0, 3, 6, 9];

/** Adds the symptom if missing, removes it if present. */
export function toggleSymptom(symptoms: string[], symptom: string): string[] {
  return symptoms.includes(symptom)
    ? symptoms.filter((s) => s !== symptom)
    : [...symptoms, symptom];
}
