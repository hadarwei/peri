import { phaseForDay } from './phase';

describe('phaseForDay', () => {
  it.each([
    [1, 'period'],
    [5, 'period'],
    [6, 'follicular'],
    [9, 'follicular'],
    [10, 'fertile'],
    [15, 'fertile'],
    [16, 'luteal'],
    [28, 'luteal'],
  ])('day %i is %s', (day, phase) => {
    expect(phaseForDay(day)).toBe(phase);
  });

  it('rejects invalid days', () => {
    expect(() => phaseForDay(0)).toThrow();
    expect(() => phaseForDay(1.5)).toThrow();
  });
});
