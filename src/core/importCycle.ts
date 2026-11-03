export type ImportDateCheck = 'ok' | 'future' | 'exists';

/** Can a previous cycle start on `date`? Not in the future, and not on a date that already starts one. */
export function checkImportDate(
  date: string,
  today: string,
  existingStarts: readonly string[],
): ImportDateCheck {
  if (date > today) return 'future';
  if (existingStarts.includes(date)) return 'exists';
  return 'ok';
}
