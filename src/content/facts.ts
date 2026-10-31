/**
 * "Did you know?" sample content. Every educational text stays `reviewed: false` until a medical
 * professional approves it; the app must not present unreviewed text as medical advice.
 */
export interface Fact {
  id: string;
  text: string;
  reviewed: boolean;
}

export const FACTS: Fact[] = [
  {
    id: 'cycle-is-personal',
    text: 'אורך המחזור הוא אישי, ולא חייב להיות 28 ימים. ככל שנתעד יותר, כך התחזית תהיה מדויקת יותר.',
    reviewed: false,
  },
];
