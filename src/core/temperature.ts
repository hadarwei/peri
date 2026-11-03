export const TEMP_STEP = 0.05;
export const TEMP_MIN = 34;
export const TEMP_MAX = 41;
export const TEMP_DEFAULT_START = 36.5;

/** Moves a temperature by one step (`direction` +1 or -1), exactly, within the allowed range. */
export function stepTemperature(celsius: number, direction: 1 | -1): number {
  // Work in hundredths of a degree so 36.55 + 0.05 is exactly 36.60 (no floating point drift).
  const hundredths = Math.round(celsius * 100) + direction * Math.round(TEMP_STEP * 100);
  const clamped = Math.min(Math.max(hundredths, TEMP_MIN * 100), TEMP_MAX * 100);
  return clamped / 100;
}

/** Where the +/- buttons start: the last saved value, or a typical resting temperature. */
export function startingTemperature(lastSaved: number | null): number {
  return lastSaved ?? TEMP_DEFAULT_START;
}

/** Two decimals, e.g. 36.5 -> "36.50". */
export function formatTemperature(celsius: number): string {
  return celsius.toFixed(2);
}
