import { buildChart, linePath, summarizeChart } from './tempChart';

const TODAY = '2026-11-30';
const r = (date: string, celsius: number, unusual = false) => ({ date, celsius, unusual });

describe('buildChart', () => {
  it('no readings: an empty chart', () => {
    const c = buildChart([], TODAY, 300, 100);
    expect(c).toMatchObject({ hasData: false, points: [], linePoints: [] });
  });

  it('ignores readings older than 30 days and in the future', () => {
    const c = buildChart(
      [r('2026-10-30', 36.4), r('2026-11-01', 36.5), r('2026-12-01', 36.6)],
      TODAY,
      290,
      100,
    );
    expect(c.points.map((p) => p.date)).toEqual(['2026-11-01']);
  });

  it('puts the first day of the window at the left and today at the right', () => {
    const c = buildChart([r('2026-11-01', 36.4), r(TODAY, 36.6)], TODAY, 290, 100);
    expect(c.points[0].x).toBe(0);
    expect(c.points[1].x).toBe(290);
  });

  it('a warmer reading is higher in the chart (smaller y)', () => {
    const c = buildChart([r('2026-11-10', 36.3), r('2026-11-11', 36.8)], TODAY, 300, 100);
    expect(c.points[1].y).toBeLessThan(c.points[0].y);
    expect(c.yMin).toBeLessThanOrEqual(36.3 - 0.1);
    expect(c.yMax).toBeGreaterThanOrEqual(36.8 + 0.1);
  });

  it('unusual readings are points but stay out of the line', () => {
    const c = buildChart(
      [r('2026-11-10', 36.4), r('2026-11-11', 37.2, true), r('2026-11-12', 36.5)],
      TODAY,
      300,
      100,
    );
    expect(c.points).toHaveLength(3);
    expect(c.linePoints.map((p) => p.date)).toEqual(['2026-11-10', '2026-11-12']);
  });

  it('a single reading does not divide by zero', () => {
    const c = buildChart([r('2026-11-10', 36.5)], TODAY, 300, 100);
    expect(Number.isFinite(c.points[0].y)).toBe(true);
  });

  it('readings are sorted by date whatever the input order', () => {
    const c = buildChart([r('2026-11-12', 36.5), r('2026-11-10', 36.4)], TODAY, 300, 100);
    expect(c.points.map((p) => p.date)).toEqual(['2026-11-10', '2026-11-12']);
  });
});

describe('linePath', () => {
  it('starts with M, continues with L, and is empty for fewer than two points', () => {
    expect(
      linePath([
        { x: 0, y: 10 },
        { x: 20, y: 5 },
      ]),
    ).toBe('M0.0,10.0 L20.0,5.0');
    expect(linePath([{ x: 0, y: 10 }])).toBe('');
    expect(linePath([])).toBe('');
  });
});

describe('summarizeChart', () => {
  it('is null without data', () => {
    expect(summarizeChart(buildChart([], TODAY, 300, 100))).toBeNull();
  });

  it('counts readings, finds the range and the latest reading', () => {
    const c = buildChart(
      [r('2026-11-12', 36.8), r('2026-11-10', 36.3), r('2026-11-11', 36.5, true)],
      TODAY,
      300,
      100,
    );
    expect(summarizeChart(c)).toEqual({
      count: 3,
      min: 36.3,
      max: 36.8,
      last: { celsius: 36.8, date: '2026-11-12' },
    });
  });
});
