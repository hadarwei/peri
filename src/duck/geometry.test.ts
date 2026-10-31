import { dropPath, heartPath, quadPoint, sparklePath } from './geometry';

describe('duck geometry', () => {
  it('quadPoint hits the end points and bends towards the control point', () => {
    const a = { x: 0, y: 0 };
    const c = { x: 50, y: -40 };
    const b = { x: 100, y: 0 };
    expect(quadPoint(a, c, b, 0)).toEqual(a);
    expect(quadPoint(a, c, b, 1)).toEqual(b);
    expect(quadPoint(a, c, b, 0.5)).toEqual({ x: 50, y: -20 });
  });

  it('sparkle has 8 corners and reaches the radius', () => {
    const p = sparklePath(10);
    expect(p.match(/[ML]/g)).toHaveLength(8);
    expect(p).toContain('M0,-10');
  });

  it('heart and drop are closed paths', () => {
    expect(heartPath(5).endsWith('Z')).toBe(true);
    expect(dropPath(5).endsWith('Z')).toBe(true);
  });
});
