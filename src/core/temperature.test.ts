import { formatTemperature, startingTemperature, stepTemperature } from './temperature';

describe('stepTemperature', () => {
  it('moves by exactly 0.05 with no floating point drift', () => {
    expect(stepTemperature(36.5, 1)).toBe(36.55);
    expect(stepTemperature(36.55, 1)).toBe(36.6);
    expect(stepTemperature(36.6, -1)).toBe(36.55);
    expect(stepTemperature(36.1, 1)).toBe(36.15);
  });

  it('twenty steps up and twenty down returns to the start', () => {
    let v = 36.45;
    for (let i = 0; i < 20; i++) v = stepTemperature(v, 1);
    expect(v).toBe(37.45);
    for (let i = 0; i < 20; i++) v = stepTemperature(v, -1);
    expect(v).toBe(36.45);
  });

  it('stops at the limits', () => {
    expect(stepTemperature(34, -1)).toBe(34);
    expect(stepTemperature(41, 1)).toBe(41);
  });
});

describe('startingTemperature / formatTemperature', () => {
  it('starts from the last saved value, or 36.50', () => {
    expect(startingTemperature(36.72)).toBe(36.72);
    expect(startingTemperature(null)).toBe(36.5);
  });

  it('always shows two decimals', () => {
    expect(formatTemperature(36.5)).toBe('36.50');
    expect(formatTemperature(37)).toBe('37.00');
    expect(formatTemperature(36.55)).toBe('36.55');
  });
});
