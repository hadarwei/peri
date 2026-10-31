/** How the duck looks. Which one applies is decided by the cycle logic in a later stage. */
export const DUCK_STATES = [
  'normal',
  'period',
  'pre',
  'fertile',
  'ovulation',
  'late',
  'pregnancy',
  'dreaming',
  'traveling',
] as const;

export type DuckState = (typeof DUCK_STATES)[number];
