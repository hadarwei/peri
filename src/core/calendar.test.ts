import { dayInfo, monthGrid, phaseForCycleDay, shiftMonth } from './calendar';

describe('monthGrid', () => {
  it('starts on Sunday and pads with days of the neighbouring months', () => {
    const grid = monthGrid(2026, 10); // 1 Oct 2026 is a Thursday
    expect(grid[0][0]).toEqual({ date: '2026-09-27', inMonth: false });
    expect(grid[0][4]).toEqual({ date: '2026-10-01', inMonth: true });
    expect(grid.every((row) => row.length === 7)).toBe(true);
  });

  it('a month starting on Sunday has no leading padding', () => {
    const grid = monthGrid(2026, 11); // 1 Nov 2026 is a Sunday
    expect(grid[0][0]).toEqual({ date: '2026-11-01', inMonth: true });
    expect(grid).toHaveLength(5);
  });

  it('uses six rows when the month needs them', () => {
    expect(monthGrid(2026, 8)).toHaveLength(6); // 1 Aug 2026 is a Saturday, 31 days
  });

  it('knows leap February and February in a regular year', () => {
    const inMonth = (y: number, m: number) =>
      monthGrid(y, m)
        .flat()
        .filter((c) => c.inMonth).length;
    expect(inMonth(2028, 2)).toBe(29);
    expect(inMonth(2027, 2)).toBe(28);
  });
});

describe('shiftMonth', () => {
  it('wraps the year in both directions', () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth(2026, 5, 1)).toEqual({ year: 2026, month: 6 });
  });
});

describe('phaseForCycleDay (28 day cycle)', () => {
  it.each([
    [1, 'period'],
    [5, 'period'],
    [6, 'follicular'],
    [8, 'follicular'],
    [9, 'fertile'],
    [14, 'fertile'],
    [15, 'luteal'],
    [28, 'luteal'],
    [35, 'luteal'],
  ])('day %i is %s', (day, phase) => {
    expect(phaseForCycleDay(day, 28)).toBe(phase);
  });

  it('a short cycle never lets the fertile window swallow the period', () => {
    expect(phaseForCycleDay(5, 20)).toBe('period');
    expect(phaseForCycleDay(6, 20)).toBe('fertile');
  });

  it('a long cycle moves ovulation later', () => {
    expect(phaseForCycleDay(14, 35)).toBe('follicular');
    expect(phaseForCycleDay(17, 35)).toBe('fertile');
    expect(phaseForCycleDay(22, 35)).toBe('luteal');
  });
});

describe('dayInfo', () => {
  const cycles = [
    { startDate: '2026-09-01', endDate: '2026-09-28' }, // 28 days
    { startDate: '2026-09-29', endDate: null }, // open
  ];
  const TODAY = '2026-10-10'; // day 12 of the open cycle

  it('is empty before the first cycle', () => {
    expect(dayInfo('2026-08-31', cycles, TODAY)).toEqual({
      phase: null,
      cycleDay: null,
      predicted: false,
    });
  });

  it('uses the real length of a closed cycle and is not a prediction', () => {
    expect(dayInfo('2026-09-03', cycles, TODAY)).toEqual({
      phase: 'period',
      cycleDay: 3,
      predicted: false,
    });
    expect(dayInfo('2026-09-28', cycles, TODAY)).toEqual({
      phase: 'luteal',
      cycleDay: 28,
      predicted: false,
    });
  });

  it('today inside the open cycle is a record, not a prediction', () => {
    expect(dayInfo(TODAY, cycles, TODAY)).toEqual({
      phase: 'fertile',
      cycleDay: 12,
      predicted: false,
    });
  });

  it('future days are predictions and repeat a 28 day cycle', () => {
    // 2026-10-27 is exactly 28 days after 2026-09-29: day 1 of the next predicted cycle
    expect(dayInfo('2026-10-27', cycles, TODAY)).toEqual({
      phase: 'period',
      cycleDay: 1,
      predicted: true,
    });
    expect(dayInfo('2026-10-20', cycles, TODAY)).toEqual({
      phase: 'luteal',
      cycleDay: 22,
      predicted: true,
    });
  });

  it('with no cycles nothing has a phase', () => {
    expect(dayInfo('2026-10-10', [], TODAY).phase).toBeNull();
  });
});
