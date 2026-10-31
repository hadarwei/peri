import type { Db } from '../types';

export interface DayLog {
  date: string; // 'YYYY-MM-DD'
  flow: number | null; // 0-3
  mood: number | null; // 1-5
  pain: number | null; // 0-10
  energy: number | null; // 1-5
  symptoms: string[];
  note: string;
  updatedAt: string; // ISO
}

/** Fields you may set. `undefined` keeps the stored value; `null` clears it. */
export type DayLogPatch = Partial<Omit<DayLog, 'date' | 'updatedAt'>>;

interface Row {
  date: string;
  flow: number | null;
  mood: number | null;
  pain: number | null;
  energy: number | null;
  symptoms: string;
  note: string;
  updated_at: string;
}

const COLUMNS = 'date, flow, mood, pain, energy, symptoms, note, updated_at';

function fromRow(r: Row): DayLog {
  return {
    date: r.date,
    flow: r.flow,
    mood: r.mood,
    pain: r.pain,
    energy: r.energy,
    symptoms: JSON.parse(r.symptoms) as string[],
    note: r.note,
    updatedAt: r.updated_at,
  };
}

export async function getDayLog(db: Db, date: string): Promise<DayLog | null> {
  const row = await db.getFirstAsync<Row>(`SELECT ${COLUMNS} FROM day_logs WHERE date = ?`, [date]);
  return row ? fromRow(row) : null;
}

/** Inclusive range, oldest first. */
export async function getDayLogsInRange(db: Db, start: string, end: string): Promise<DayLog[]> {
  const rows = await db.getAllAsync<Row>(
    `SELECT ${COLUMNS} FROM day_logs WHERE date BETWEEN ? AND ? ORDER BY date ASC`,
    [start, end],
  );
  return rows.map(fromRow);
}

export async function countDayLogs(db: Db): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM day_logs');
  return row?.n ?? 0;
}

/** Creates or updates the log for `date`, changing only the fields in `patch`. */
export async function upsertDayLog(
  db: Db,
  date: string,
  patch: DayLogPatch,
  now: Date = new Date(),
): Promise<DayLog> {
  const existing = await getDayLog(db, date);
  const merged = {
    flow: patch.flow === undefined ? (existing?.flow ?? null) : patch.flow,
    mood: patch.mood === undefined ? (existing?.mood ?? null) : patch.mood,
    pain: patch.pain === undefined ? (existing?.pain ?? null) : patch.pain,
    energy: patch.energy === undefined ? (existing?.energy ?? null) : patch.energy,
    symptoms: patch.symptoms ?? existing?.symptoms ?? [],
    note: patch.note ?? existing?.note ?? '',
  };
  const updatedAt = now.toISOString();
  await db.runAsync(
    `INSERT INTO day_logs (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       flow = excluded.flow, mood = excluded.mood, pain = excluded.pain,
       energy = excluded.energy, symptoms = excluded.symptoms, note = excluded.note,
       updated_at = excluded.updated_at`,
    [
      date,
      merged.flow,
      merged.mood,
      merged.pain,
      merged.energy,
      JSON.stringify(merged.symptoms),
      merged.note,
      updatedAt,
    ],
  );
  return { date, ...merged, updatedAt };
}
