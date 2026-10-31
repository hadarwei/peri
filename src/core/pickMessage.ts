/**
 * Picks a message from `list` at random, never the same one twice in a row.
 * `last` is the index returned last time (or null). `rng` returns [0, 1).
 */
export function pickMessageIndex(
  length: number,
  last: number | null,
  rng: () => number = Math.random,
): number {
  if (length <= 0) throw new Error('No messages to pick from');
  if (length === 1) return 0;
  const pool = Array.from({ length }, (_, i) => i).filter((i) => i !== last);
  return pool[Math.min(Math.floor(rng() * pool.length), pool.length - 1)];
}
