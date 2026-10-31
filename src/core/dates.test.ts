import { addDays, diffInDays, parseLocalDate, startOfLocalDay, toLocalDateString } from './dates';

const ORIGINAL_TZ = process.env.TZ;
afterEach(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});
const setTz = (tz: string) => {
  process.env.TZ = tz;
};

describe('toLocalDateString / parseLocalDate', () => {
  it('formats with zero padding', () => {
    setTz('Asia/Jerusalem');
    expect(toLocalDateString(new Date(2026, 0, 5, 13, 30))).toBe('2026-01-05');
  });

  it('round-trips', () => {
    setTz('Asia/Jerusalem');
    expect(toLocalDateString(parseLocalDate('2026-10-31'))).toBe('2026-10-31');
  });

  it('parses to local midnight', () => {
    setTz('Asia/Jerusalem');
    const d = parseLocalDate('2026-10-31');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 9, 31, 0]);
  });

  it('rejects malformed and impossible dates', () => {
    expect(() => parseLocalDate('2026-1-5')).toThrow();
    expect(() => parseLocalDate('2026-02-30')).toThrow();
    expect(() => parseLocalDate('not a date')).toThrow();
  });
});

describe('time zone change', () => {
  it('the same instant is a different local date in different zones', () => {
    const instant = new Date('2026-01-01T23:30:00Z');
    setTz('Asia/Jerusalem');
    expect(toLocalDateString(instant)).toBe('2026-01-02');
    setTz('America/New_York');
    expect(toLocalDateString(instant)).toBe('2026-01-01');
  });

  it('a stored date string keeps its meaning after the zone changes (traveling)', () => {
    setTz('Asia/Jerusalem');
    const stored = toLocalDateString(new Date(2026, 5, 15, 23, 59));
    setTz('Pacific/Auckland');
    expect(toLocalDateString(parseLocalDate(stored))).toBe(stored);
    expect(diffInDays(parseLocalDate('2026-06-16'), parseLocalDate(stored))).toBe(1);
  });
});

describe('daylight saving time', () => {
  it('addDays crosses US spring-forward (23-hour day) correctly', () => {
    setTz('America/New_York');
    const d = parseLocalDate('2026-03-07');
    expect(toLocalDateString(addDays(d, 1))).toBe('2026-03-08');
    expect(toLocalDateString(addDays(d, 2))).toBe('2026-03-09');
    expect(addDays(d, 2).getHours()).toBe(0);
  });

  it('addDays crosses US fall-back (25-hour day) correctly', () => {
    setTz('America/New_York');
    const d = parseLocalDate('2026-10-31');
    expect(toLocalDateString(addDays(d, 1))).toBe('2026-11-01');
    expect(toLocalDateString(addDays(d, 2))).toBe('2026-11-02');
  });

  it('addDays crosses the end of Israel DST (2026-10-25) correctly', () => {
    setTz('Asia/Jerusalem');
    expect(toLocalDateString(addDays(parseLocalDate('2026-10-24'), 2))).toBe('2026-10-26');
  });

  it('diffInDays counts calendar days across a DST change', () => {
    setTz('America/New_York');
    expect(diffInDays(parseLocalDate('2026-03-09'), parseLocalDate('2026-03-07'))).toBe(2);
    expect(diffInDays(parseLocalDate('2026-11-02'), parseLocalDate('2026-10-31'))).toBe(2);
  });

  it('diffInDays ignores the time of day and can be negative', () => {
    setTz('Asia/Jerusalem');
    expect(diffInDays(new Date(2026, 0, 3, 1, 0), new Date(2026, 0, 1, 23, 0))).toBe(2);
    expect(diffInDays(parseLocalDate('2026-01-01'), parseLocalDate('2026-01-04'))).toBe(-3);
  });
});

describe('addDays / startOfLocalDay', () => {
  it('handles month and year boundaries and leap years', () => {
    setTz('Asia/Jerusalem');
    expect(toLocalDateString(addDays(parseLocalDate('2026-12-31'), 1))).toBe('2027-01-01');
    expect(toLocalDateString(addDays(parseLocalDate('2028-02-28'), 1))).toBe('2028-02-29');
    expect(toLocalDateString(addDays(parseLocalDate('2026-03-01'), -1))).toBe('2026-02-28');
  });

  it('does not mutate its input', () => {
    setTz('Asia/Jerusalem');
    const d = parseLocalDate('2026-05-05');
    addDays(d, 10);
    expect(toLocalDateString(d)).toBe('2026-05-05');
  });

  it('startOfLocalDay zeroes the time', () => {
    setTz('Asia/Jerusalem');
    const s = startOfLocalDay(new Date(2026, 4, 5, 17, 45, 12, 500));
    expect([s.getHours(), s.getMinutes(), s.getSeconds(), s.getMilliseconds()]).toEqual([
      0, 0, 0, 0,
    ]);
  });
});
