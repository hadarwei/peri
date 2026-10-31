import { DUCK_SEQUENCES, frameForProgress } from './duckSequence';

describe('duck sequences', () => {
  it('walk cycles 1, 2, 3, 2', () => {
    const seq = DUCK_SEQUENCES.walk;
    expect([0, 1, 2, 3].map((p) => frameForProgress(seq, p + 0.5))).toEqual([
      'walk1',
      'walk2',
      'walk3',
      'walk2',
    ]);
  });

  it('dance cycles 1, 2, 3, 2', () => {
    expect([0.1, 1.1, 2.1, 3.1].map((p) => frameForProgress(DUCK_SEQUENCES.dance, p))).toEqual([
      'dance1',
      'dance2',
      'dance3',
      'dance2',
    ]);
  });

  it('idle is always stand, and the end of a loop never overflows', () => {
    expect(frameForProgress(DUCK_SEQUENCES.idle, 0)).toBe('stand');
    expect(frameForProgress(DUCK_SEQUENCES.walk, 4)).toBe('walk2'); // clamped to the last frame
    expect(frameForProgress(DUCK_SEQUENCES.walk, -1)).toBe('walk1');
  });
});
