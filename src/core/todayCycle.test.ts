import { todayCycle } from './todayCycle';

describe('todayCycle', () => {
  it('on the start day it is day 1, period in 28 days, ovulation in 14', () => {
    expect(todayCycle('2026-11-03', '2026-11-03')).toEqual({
      dayOfCycle: 1,
      daysToPeriod: 28,
      daysToOvulation: 14,
    });
  });

  it('matches what the calendar shows for a cycle that started 26 days ago', () => {
    // start Oct 8, today Nov 3: day 27, period Nov 5 (in 2 days), ovulation already passed
    expect(todayCycle('2026-10-08', '2026-11-03')).toEqual({
      dayOfCycle: 27,
      daysToPeriod: 2,
      daysToOvulation: -12,
    });
  });

  it('a late period gives zero or negative days and a day count past 28', () => {
    expect(todayCycle('2026-10-01', '2026-11-03')).toMatchObject({
      dayOfCycle: 34,
      daysToPeriod: -5,
    });
  });

  it('works across a year boundary', () => {
    expect(todayCycle('2026-12-20', '2027-01-02').dayOfCycle).toBe(14);
  });
});
