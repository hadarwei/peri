import { summarizeCycle } from './history';

const TODAY = '2026-11-10';

describe('summarizeCycle', () => {
  it('a closed cycle: length from start to end, inclusive', () => {
    const s = summarizeCycle({ id: 1, startDate: '2026-10-01', endDate: '2026-10-28' }, [], TODAY);
    expect(s).toMatchObject({ open: false, days: 28, periodDays: null });
  });

  it('phase days add up to the cycle length', () => {
    const s = summarizeCycle({ id: 1, startDate: '2026-10-01', endDate: '2026-10-28' }, [], TODAY);
    expect(s.phaseDays).toEqual({ period: 5, follicular: 3, fertile: 6, luteal: 14 });
    expect(Object.values(s.phaseDays).reduce((a, b) => a + b, 0)).toBe(28);
  });

  it('a longer cycle moves the fertile window later', () => {
    const s = summarizeCycle({ id: 1, startDate: '2026-10-01', endDate: '2026-11-04' }, [], TODAY); // 35 days
    expect(s.days).toBe(35);
    expect(s.phaseDays).toEqual({ period: 5, follicular: 10, fertile: 6, luteal: 14 });
  });

  it('the open cycle counts days so far and is assumed to be 28 days long', () => {
    const s = summarizeCycle({ id: 1, startDate: '2026-10-30', endDate: null }, [], TODAY); // day 12
    expect(s).toMatchObject({ open: true, days: 12, endDate: null });
    expect(s.phaseDays).toEqual({ period: 5, follicular: 3, fertile: 4, luteal: 0 });
  });

  it('an open cycle that runs past 28 days keeps going in the luteal phase', () => {
    const s = summarizeCycle({ id: 1, startDate: '2026-10-01', endDate: null }, [], TODAY); // day 41
    expect(s.days).toBe(41);
    expect(s.phaseDays.luteal).toBe(41 - 14);
  });

  it('period length counts consecutive bleeding days from the start', () => {
    const logs = [
      { date: '2026-10-01', flow: 2 },
      { date: '2026-10-02', flow: 3 },
      { date: '2026-10-03', flow: 1 },
      { date: '2026-10-04', flow: 0 },
      { date: '2026-10-05', flow: 2 }, // after a dry day: not part of the period
    ];
    expect(
      summarizeCycle({ id: 1, startDate: '2026-10-01', endDate: '2026-10-28' }, logs, TODAY)
        .periodDays,
    ).toBe(3);
  });

  it('period length is unknown when no bleeding was logged', () => {
    const logs = [{ date: '2026-10-01', flow: null }];
    expect(
      summarizeCycle({ id: 1, startDate: '2026-10-01', endDate: '2026-10-28' }, logs, TODAY)
        .periodDays,
    ).toBeNull();
  });

  it('passes the cycle id through, so the card can edit or delete the right cycle', () => {
    expect(summarizeCycle({ id: 42, startDate: '2026-10-01', endDate: null }, [], TODAY).id).toBe(
      42,
    );
  });
});
