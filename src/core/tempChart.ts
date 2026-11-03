import { addDays, diffInDays, parseLocalDate, toLocalDateString } from './dates';

export interface Reading {
  date: string; // 'YYYY-MM-DD'
  celsius: number;
  unusual: boolean;
}

export interface ChartPoint {
  date: string;
  celsius: number;
  unusual: boolean;
  /** Position in the chart box, in pixels (y grows downwards). */
  x: number;
  y: number;
}

export interface ChartModel {
  /** Every reading inside the window. */
  points: ChartPoint[];
  /** The points the line runs through: unusual readings are left out of the line. */
  linePoints: ChartPoint[];
  yMin: number;
  yMax: number;
  hasData: boolean;
  firstDate: string;
  lastDate: string;
}

export const CHART_DAYS = 30;
const Y_PADDING = 0.1; // degrees above and below the data

/** Lays the last `days` days of readings out in a `width` x `height` box. */
export function buildChart(
  readings: readonly Reading[],
  today: string,
  width: number,
  height: number,
  days = CHART_DAYS,
): ChartModel {
  const first = toLocalDateString(addDays(parseLocalDate(today), -(days - 1)));
  const inWindow = readings
    .filter((r) => r.date >= first && r.date <= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  if (inWindow.length === 0) {
    return {
      points: [],
      linePoints: [],
      yMin: 0,
      yMax: 0,
      hasData: false,
      firstDate: first,
      lastDate: today,
    };
  }

  const values = inWindow.map((r) => r.celsius);
  const yMin = Math.floor((Math.min(...values) - Y_PADDING) * 20) / 20;
  const yMax = Math.ceil((Math.max(...values) + Y_PADDING) * 20) / 20;
  const span = yMax - yMin || 1;

  const points: ChartPoint[] = inWindow.map((r) => ({
    ...r,
    x: (diffInDays(parseLocalDate(r.date), parseLocalDate(first)) / (days - 1)) * width,
    y: height - ((r.celsius - yMin) / span) * height,
  }));
  return {
    points,
    linePoints: points.filter((p) => !p.unusual),
    yMin,
    yMax,
    hasData: true,
    firstDate: first,
    lastDate: today,
  };
}

/** SVG path through the points, e.g. "M0,10 L20,5". Empty string for fewer than 2 points. */
export function linePath(points: readonly { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
}

export interface ChartSummary {
  count: number;
  min: number;
  max: number;
  last: { celsius: number; date: string };
}

/** Numbers for the text alternative: how many readings, their range, and the latest one. */
export function summarizeChart(model: ChartModel): ChartSummary | null {
  if (!model.hasData) return null;
  const values = model.points.map((p) => p.celsius);
  const last = model.points[model.points.length - 1];
  return {
    count: model.points.length,
    min: Math.min(...values),
    max: Math.max(...values),
    last: { celsius: last.celsius, date: last.date },
  };
}
