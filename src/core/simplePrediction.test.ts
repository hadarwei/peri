import { simplePrediction } from './simplePrediction';

describe('simplePrediction (stand-in until stage 6)', () => {
  it('predicts the next period 28 days after the last start', () => {
    expect(simplePrediction('2026-10-01').predictedPeriodStart).toBe('2026-10-29');
  });

  it('estimates ovulation 14 days before the next period', () => {
    expect(simplePrediction('2026-10-01').ovulation).toBe('2026-10-15');
  });

  it('fertile window runs from 5 days before ovulation through ovulation day', () => {
    expect(simplePrediction('2026-10-01').fertileWindow).toEqual({
      start: '2026-10-10',
      end: '2026-10-15',
    });
  });

  it('works across month and year boundaries', () => {
    expect(simplePrediction('2026-12-10').predictedPeriodStart).toBe('2027-01-07');
  });
});
