import type { Db } from '../types';

export interface TemperatureReading {
  date: string; // 'YYYY-MM-DD'
  celsius: number;
  measuredAt: string; // ISO
  unusual: boolean; // illness, alcohol, bad sleep: leave this reading out of conclusions
  note: string;
}

interface Row {
  date: string;
  celsius: number;
  measured_at: string;
  unusual: number;
  note: string;
}

const COLUMNS = 'date, celsius, measured_at, unusual, note';

const fromRow = (r: Row): TemperatureReading => ({
  date: r.date,
  celsius: r.celsius,
  measuredAt: r.measured_at,
  unusual: r.unusual === 1,
  note: r.note,
});

/** One reading per date: saving again for the same date replaces it. */
export async function upsertTemperature(
  db: Db,
  date: string,
  reading: { celsius: number; unusual?: boolean; note?: string },
  now: Date = new Date(),
): Promise<TemperatureReading> {
  const unusual = reading.unusual ? 1 : 0;
  const note = reading.note ?? '';
  const measuredAt = now.toISOString();
  await db.runAsync(
    `INSERT INTO temperature_readings (${COLUMNS}) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       celsius = excluded.celsius, measured_at = excluded.measured_at,
       unusual = excluded.unusual, note = excluded.note`,
    [date, reading.celsius, measuredAt, unusual, note],
  );
  return { date, celsius: reading.celsius, measuredAt, unusual: unusual === 1, note };
}

export async function getTemperature(db: Db, date: string): Promise<TemperatureReading | null> {
  const row = await db.getFirstAsync<Row>(
    `SELECT ${COLUMNS} FROM temperature_readings WHERE date = ?`,
    [date],
  );
  return row ? fromRow(row) : null;
}

/** The most recent reading by date, or null. */
export async function getLastTemperature(db: Db): Promise<TemperatureReading | null> {
  const row = await db.getFirstAsync<Row>(
    `SELECT ${COLUMNS} FROM temperature_readings ORDER BY date DESC LIMIT 1`,
  );
  return row ? fromRow(row) : null;
}

/** Inclusive range, oldest first. */
export async function getTemperaturesInRange(
  db: Db,
  start: string,
  end: string,
): Promise<TemperatureReading[]> {
  const rows = await db.getAllAsync<Row>(
    `SELECT ${COLUMNS} FROM temperature_readings WHERE date BETWEEN ? AND ? ORDER BY date ASC`,
    [start, end],
  );
  return rows.map(fromRow);
}

/** Dates that have a reading, oldest first (used to plan reminders). */
export async function getTemperatureDates(db: Db): Promise<string[]> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM temperature_readings ORDER BY date ASC',
  );
  return rows.map((r) => r.date);
}
