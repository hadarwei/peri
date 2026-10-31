export type Phase = 'period' | 'follicular' | 'fertile' | 'luteal';

/**
 * Display phase for a day of a 28-day sample cycle (1-based):
 * period 1-5, follicular 6-9, fertile 10-15, luteal 16-28.
 * Placeholder until stage 6 computes phases from real predictions.
 */
export function phaseForDay(day: number): Phase {
  if (!Number.isInteger(day) || day < 1) throw new Error(`Invalid cycle day: ${day}`);
  if (day <= 5) return 'period';
  if (day <= 9) return 'follicular';
  if (day <= 15) return 'fertile';
  return 'luteal';
}
