import { addDays, diffInDays, parseLocalDate, startOfLocalDay, toLocalDateString } from './dates';

// Jest cannot change the time zone mid-run, so scripts/test-tz.js runs this file once per zone
// (TZ env var). Tests below either hold in every zone, or are tagged with the zone they need.
const TZ = process.env.TZ;
const itIn = (zone: string) => (TZ === zone ? it : it.skip);

describe('toLocalDateString / parseLocalDate (any zone)', () => {
  it('formats with zero padding', () => {
    expect(toLocalDateString(new Date(2026, 0, 5, 13, 30))).toBe('2026-01-05');
  });

  it('round-trips', () => {
    expect(toLocalDateString(parseLocalDate('2026-10-31'))).toBe('2026-10-31');
  });

  it('parses to local midnight', () => {
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
  const instant = () => new Date('2026-01-01T23:30:00Z');

  itIn('Asia/Jerusalem')('the same instant is Jan 2 in Jerusalem (UTC+2)', () => {
    expect(toLocalDateString(instant())).toBe('2026-01-02');
  });
  itIn('America/New_York')('the same instant is Jan 1 in New York (UTC-5)', () => {
    expect(toLocalDateString(instant())).toBe('2026-01-01');
  });
  itIn('Pacific/Auckland')('the same instant is Jan 2 in Auckland (UTC+13)', () => {
    expect(toLocalDateString(instant())).toBe('2026-01-02');
  });

  it('a stored date string keeps its meaning in whatever zone the phone is in (traveling)', () => {
    const stored = '2026-06-15';
    expect(toLocalDateString(parseLocalDate(stored))).toBe(stored);
    expect(diffInDays(parseLocalDate('2026-06-16'), parseLocalDate(stored))).toBe(1);
  });
});

describe('daylight saving time', () => {
  itIn('America/New_York')('addDays crosses US spring-forward (23-hour day 2026-03-08)', () => {
    const d = parseLocalDate('2026-03-07');
    expect(toLocalDateString(addDays(d, 1))).toBe('2026-03-08');
    expect(toLocalDateString(addDays(d, 2))).toBe('2026-03-09');
    expect(addDays(d, 2).getHours()).toBe(0);
    // Proof this day really is short: 23 hours between the two midnights.
    expect(parseLocalDate('2026-03-09').getTime() - parseLocalDate('2026-03-08').getTime()).toBe(
      23 * 3_600_000,
    );
  });

  itIn('America/New_York')('addDays crosses US fall-back (25-hour day 2026-11-01)', () => {
    const d = parseLocalDate('2026-10-31');
    expect(toLocalDateString(addDays(d, 1))).toBe('2026-11-01');
    expect(toLocalDateString(addDays(d, 2))).toBe('2026-11-02');
    expect(parseLocalDate('2026-11-02').getTime() - parseLocalDate('2026-11-01').getTime()).toBe(
      25 * 3_600_000,
    );
  });

  itIn('Asia/Jerusalem')('addDays crosses the end of Israel DST (2026-10-25)', () => {
    expect(toLocalDateString(addDays(parseLocalDate('2026-10-24'), 2))).toBe('2026-10-26');
    expect(parseLocalDate('2026-10-26').getTime() - parseLocalDate('2026-10-25').getTime()).toBe(
      25 * 3_600_000,
    );
  });

  it('diffInDays counts calendar days across DST changes (any zone)', () => {
    expect(diffInDays(parseLocalDate('2026-03-09'), parseLocalDate('2026-03-07'))).toBe(2);
    expect(diffInDays(parseLocalDate('2026-11-02'), parseLocalDate('2026-10-31'))).toBe(2);
    expect(diffInDays(parseLocalDate('2026-10-26'), parseLocalDate('2026-10-24'))).toBe(2);
  });

  it('diffInDays ignores the time of day and can be negative', () => {
    expect(diffInDays(new Date(2026, 0, 3, 1, 0), new Date(2026, 0, 1, 23, 0))).toBe(2);
    expect(diffInDays(parseLocalDate('2026-01-01'), parseLocalDate('2026-01-04'))).toBe(-3);
  });
});

describe('addDays / startOfLocalDay (any zone)', () => {
  it('handles month and year boundaries and leap years', () => {
    expect(toLocalDateString(addDays(parseLocalDate('2026-12-31'), 1))).toBe('2027-01-01');
    expect(toLocalDateString(addDays(parseLocalDate('2028-02-28'), 1))).toBe('2028-02-29');
    expect(toLocalDateString(addDays(parseLocalDate('2026-03-01'), -1))).toBe('2026-02-28');
  });

  it('does not mutate its input', () => {
    const d = parseLocalDate('2026-05-05');
    addDays(d, 10);
    expect(toLocalDateString(d)).toBe('2026-05-05');
  });

  it('startOfLocalDay zeroes the time', () => {
    const s = startOfLocalDay(new Date(2026, 4, 5, 17, 45, 12, 500));
    expect([s.getHours(), s.getMinutes(), s.getSeconds(), s.getMilliseconds()]).toEqual([
      0, 0, 0, 0,
    ]);
  });
});
