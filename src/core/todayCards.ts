import { diffInDays, parseLocalDate } from './dates';

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

const WINDOW_AROUND_PREDICTION_DAYS = 2;

export function getTodayCards(input: TodayCardsInput): TodayCard[] {
  const alwaysOn: TodayCard[] = ['mood', 'sameAsYesterday', 'symptoms'];
  const more: TodayCard = 'moreDetails';

  // Without history there are no predictions: only the minimal set.
  if (!input.hasHistory) return [...alwaysOn, more];

  const cards: TodayCard[] = [];

  // "Did the period start?" from 2 days before the prediction onwards, until it is marked.
  // Being late is the same rule: the card keeps coming back each day (no notifications).
  if (!input.pregnancyMode && input.predictedPeriodStart && !input.periodStartMarked) {
    const daysUntil = diffInDays(
      parseLocalDate(input.predictedPeriodStart),
      parseLocalDate(input.today),
    );
    if (daysUntil <= WINDOW_AROUND_PREDICTION_DAYS) cards.push('periodStart');
  }

  cards.push(...alwaysOn);

  if (!input.pregnancyMode) {
    const inFertileWindow =
      input.fertileWindow !== null &&
      input.today >= input.fertileWindow.start &&
      input.today <= input.fertileWindow.end; // 'YYYY-MM-DD' strings compare correctly as text
    if (input.temperatureEnabled && (inFertileWindow || input.temperatureDaily)) {
      cards.push('temperature');
    }
    if (input.testsEnabled && inFertileWindow) cards.push('lhTest');
  }

  cards.push(more);
  return cards;
}
