/**
 * The symptoms a user logs most, for the quick chips. Ties go to the one seen most recently.
 * `logs` are day logs in any order; `defaults` fill the list when there is little history.
 */
export function topSymptoms(
  logs: { date: string; symptoms: string[] }[],
  count: number,
  defaults: readonly string[],
): string[] {
  const stats = new Map<string, { n: number; last: string }>();
  for (const log of logs) {
    for (const symptom of new Set(log.symptoms)) {
      const s = stats.get(symptom) ?? { n: 0, last: '' };
      s.n += 1;
      if (log.date > s.last) s.last = log.date;
      stats.set(symptom, s);
    }
  }
  const ranked = [...stats.entries()]
    .sort((a, b) => b[1].n - a[1].n || (a[1].last < b[1].last ? 1 : -1))
    .map(([name]) => name);
  for (const d of defaults) if (!ranked.includes(d)) ranked.push(d);
  return ranked.slice(0, count);
}
