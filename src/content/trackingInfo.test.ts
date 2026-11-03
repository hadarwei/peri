import { TEMPERATURE_INFO, TESTS_INFO } from './trackingInfo';

describe('tracking explanations', () => {
  it('stay marked as not medically reviewed until someone approves them', () => {
    expect(TEMPERATURE_INFO.reviewed).toBe(false);
    expect(TESTS_INFO.reviewed).toBe(false);
  });

  it('every explanation says what it cannot do', () => {
    expect(TEMPERATURE_INFO.limits.length).toBeGreaterThan(0);
    expect(TESTS_INFO.limits.length).toBeGreaterThan(0);
  });
});
