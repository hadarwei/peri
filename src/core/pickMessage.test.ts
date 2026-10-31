import { pickMessageIndex } from './pickMessage';

describe('pickMessageIndex', () => {
  it('never repeats the previous message', () => {
    for (let last = 0; last < 3; last++) {
      for (const r of [0, 0.3, 0.6, 0.99999]) {
        expect(pickMessageIndex(3, last, () => r)).not.toBe(last);
      }
    }
  });

  it('covers every other message across the random range', () => {
    const seen = new Set([0, 0.5, 0.99].map((r) => pickMessageIndex(3, 1, () => r)));
    expect([...seen].sort()).toEqual([0, 2]);
  });

  it('handles a single message and no previous message', () => {
    expect(pickMessageIndex(1, 0)).toBe(0);
    expect(pickMessageIndex(3, null, () => 0)).toBe(0);
  });

  it('rejects an empty list', () => {
    expect(() => pickMessageIndex(0, null)).toThrow();
  });
});
