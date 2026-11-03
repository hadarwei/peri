import { blend } from './color';

describe('blend', () => {
  it('returns the first colour at 0 and the second at 1', () => {
    expect(blend('#FFD3DD', '#E3E7EC', 0)).toBe('#ffd3dd');
    expect(blend('#FFD3DD', '#E3E7EC', 1)).toBe('#e3e7ec');
  });

  it('mixes halfway', () => {
    expect(blend('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  it('clamps t and keeps leading zeros', () => {
    expect(blend('#000000', '#0000ff', 2)).toBe('#0000ff');
    expect(blend('#000000', '#000001', 1)).toBe('#000001');
  });

  it('rejects anything that is not #RRGGBB', () => {
    expect(() => blend('red', '#ffffff', 0.5)).toThrow();
  });
});
