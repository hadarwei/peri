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

  it('each ready-made question asks for sources, for honesty about doubt, and forbids invented ones', () => {
    for (const info of [TEMPERATURE_INFO, TESTS_INFO]) {
      expect(info.deeperPrompt).toContain('מקורות');
      expect(info.deeperPrompt).toContain('לא בטוחה');
      expect(info.deeperPrompt).toContain('אל תמציאי');
    }
  });

  it('explanations stay short: at most two benefits and three limits', () => {
    for (const info of [TEMPERATURE_INFO, TESTS_INFO]) {
      expect(info.benefits.length).toBeLessThanOrEqual(2);
      expect(info.limits.length).toBeLessThanOrEqual(3);
    }
  });
});
