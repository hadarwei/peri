// Small pure helpers for drawing the duck's accessories (all in picture units, 260x250).

export interface Pt {
  x: number;
  y: number;
}

/** Point at t (0..1) on a quadratic curve p0 -> p2 bending towards p1. */
export function quadPoint(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

/** Four-pointed star centred on (0, 0) with the given radius, as an SVG path. */
export function sparklePath(r: number): string {
  const i = r * 0.28;
  return `M0,${-r} L${i},${-i} L${r},0 L${i},${i} L0,${r} L${-i},${i} L${-r},0 L${-i},${-i}Z`;
}

/** Heart centred on (0, 0), roughly 2*s wide, as an SVG path. */
export function heartPath(s: number): string {
  return `M0,${-0.3 * s} C${-0.4 * s},${-s} ${-1.2 * s},${-0.3 * s} 0,${0.8 * s} C${1.2 * s},${-0.3 * s} ${0.4 * s},${-s} 0,${-0.3 * s}Z`;
}

/** Water drop centred on (0, 0), pointing up. */
export function dropPath(s: number): string {
  return `M0,${-s} C${0.6 * s},${-0.1 * s} ${0.7 * s},${0.4 * s} 0,${0.8 * s} C${-0.7 * s},${0.4 * s} ${-0.6 * s},${-0.1 * s} 0,${-s}Z`;
}
