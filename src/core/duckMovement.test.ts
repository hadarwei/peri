import {
  clampToBounds,
  depthScale,
  facingScaleX,
  isOnDuck,
  nextWanderDelayMs,
  randomPoint,
  walkDurationMs,
  walkableBounds,
  type Bounds,
} from './duckMovement';

const b: Bounds = { minX: 0, maxX: 300, minY: 100, maxY: 200 };

describe('duck movement', () => {
  it('clamps points into the walkable area', () => {
    expect(clampToBounds({ x: -50, y: 500 }, b)).toEqual({ x: 0, y: 200 });
    expect(clampToBounds({ x: 120, y: 150 }, b)).toEqual({ x: 120, y: 150 });
  });

  it('random points stay inside the bounds', () => {
    expect(randomPoint(b, () => 0)).toEqual({ x: 0, y: 100 });
    expect(randomPoint(b, () => 0.999999).x).toBeLessThanOrEqual(300);
    expect(randomPoint(b, () => 0.5)).toEqual({ x: 150, y: 150 });
  });

  it('walks at about 75 px/s in a straight line', () => {
    expect(walkDurationMs({ x: 0, y: 0 }, { x: 75, y: 0 })).toBeCloseTo(1000);
    expect(walkDurationMs({ x: 0, y: 0 }, { x: 30, y: 40 })).toBeCloseTo((50 / 75) * 1000);
    expect(walkDurationMs({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('flips by direction and keeps the side when moving straight down', () => {
    expect(facingScaleX({ x: 10, y: 0 }, { x: 50, y: 0 }, -1)).toBe(1);
    expect(facingScaleX({ x: 50, y: 0 }, { x: 10, y: 0 }, 1)).toBe(-1);
    expect(facingScaleX({ x: 10, y: 0 }, { x: 10, y: 80 }, -1)).toBe(-1);
  });

  it('scales 0.85 at the top to 1.12 at the bottom', () => {
    expect(depthScale(100, b)).toBeCloseTo(0.85);
    expect(depthScale(200, b)).toBeCloseTo(1.12);
    expect(depthScale(150, b)).toBeCloseTo(0.985);
    expect(depthScale(999, b)).toBeCloseTo(1.12);
  });

  it('wander delay is between 2.5 and 5.5 seconds', () => {
    expect(nextWanderDelayMs(() => 0)).toBe(2500);
    expect(nextWanderDelayMs(() => 1)).toBe(5500);
  });

  it('keeps the feet inside the meadow, 40 px from each side', () => {
    expect(walkableBounds(390)).toEqual({ minX: 40, maxX: 350, minY: 60, maxY: 300 });
  });

  it('hit-tests the duck box above its feet', () => {
    const feet = { x: 100, y: 200 };
    expect(isOnDuck({ x: 100, y: 160 }, feet, 1)).toBe(true); // on the body
    expect(isOnDuck({ x: 100, y: 210 }, feet, 1)).toBe(false); // below the feet
    expect(isOnDuck({ x: 100, y: 100 }, feet, 1)).toBe(false); // far above the head
    expect(isOnDuck({ x: 160, y: 160 }, feet, 1)).toBe(false); // too far to the side
  });
});
