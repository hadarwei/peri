import { REAL_PHASE_COLOR, predictedPhaseColor } from './calendarColors';

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
// How far the colour is from gray: the spread between the strongest and weakest channel.
const spread = (hex: string) => Math.max(...channels(hex)) - Math.min(...channels(hex));

describe('calendar colours', () => {
  it('predicted colours are much less colourful than real ones for every phase', () => {
    for (const phase of Object.keys(REAL_PHASE_COLOR) as (keyof typeof REAL_PHASE_COLOR)[]) {
      expect(spread(predictedPhaseColor(phase))).toBeLessThan(spread(REAL_PHASE_COLOR[phase]) / 3);
    }
  });

  it('predicted colours are still different from each other, so phases stay readable', () => {
    const all = (Object.keys(REAL_PHASE_COLOR) as (keyof typeof REAL_PHASE_COLOR)[]).map(
      predictedPhaseColor,
    );
    expect(new Set(all).size).toBe(all.length);
  });
});
