function parse(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`Not a #RRGGBB colour: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Mixes two #RRGGBB colours: t = 0 gives `a`, t = 1 gives `b`. */
export function blend(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * Math.min(Math.max(t, 0), 1));
  const out = (mix(ar, br) << 16) | (mix(ag, bg) << 8) | mix(ab, bb);
  return `#${out.toString(16).padStart(6, '0')}`;
}
