/**
 * Which cards the daily check-in shows today. A pure function: everything it needs comes in as
 * plain data, so every rule can be unit-tested without a phone or a database.
 */

/** A card in the daily check-in. The order of this list is the order on screen. */
export type TodayCard =
  | 'periodStart' // "Did your period start?"
  | 'mood'
  | 'sameAsYesterday'
  | 'symptoms' // top 3 symptoms chips
  | 'temperature'
  | 'lhTest' // photo of an LH (ovulation) test
  | 'moreDetails'; // collapsed: bleeding, pain, energy, note

export interface TodayCardsInput {
  /** Today's local date, 'YYYY-MM-DD'. */
  today: string;
  /** At least one cycle (logged or imported) exists. Without history there are no predictions. */
  hasHistory: boolean;
  /** Predicted start of the next period ('YYYY-MM-DD'), or null when there is no prediction. */
  predictedPeriodStart: string | null;
  /** The user already marked a period start for this expected period. */
  periodStartMarked: boolean;
  /** Estimated fertile window, inclusive ('YYYY-MM-DD'), or null when there is no prediction. */
  fertileWindow: { start: string; end: string } | null;
  /** The user turned on body-temperature tracking. */
  temperatureEnabled: boolean;
  /** The user chose to measure every day, not only in the fertile window. */
  temperatureDaily: boolean;
  /** The user turned on LH test tracking. */
  testsEnabled: boolean;
  /** Manual pregnancy mode. */
  pregnancyMode: boolean;
}

export function getTodayCards(_input: TodayCardsInput): TodayCard[] {
  return []; // implemented in the next commit
}
