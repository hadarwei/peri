// Local calendar dates as 'YYYY-MM-DD' strings, independent of time zone and DST.
// Rule: never add 24*60*60*1000 ms to move a day (DST days are 23 or 25 hours).

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/** Local calendar date of an instant, e.g. '2026-10-31'. */
export function toLocalDateString(date: Date): string {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses 'YYYY-MM-DD' to local midnight. Throws on bad format or impossible dates. */
export function parseLocalDate(str: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!match) throw new Error(`Invalid local date: ${str}`);
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    throw new Error(`Invalid local date: ${str}`);
  }
  return date;
}

/** Local midnight of the given instant's day. */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Moves by whole calendar days (keeps the time of day). Returns a new Date. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/** Whole calendar days from b to a (a - b), ignoring time of day and DST. */
export function diffInDays(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / 86_400_000);
}
