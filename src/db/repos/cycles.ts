import type { Db } from '../types';

export interface Cycle {
  id: number;
  startDate: string;
  endDate: string | null;
  source: 'logged' | 'imported';
}

interface Row {
  id: number;
  start_date: string;
  end_date: string | null;
  source: 'logged' | 'imported';
}

const fromRow = (r: Row): Cycle => ({
  id: r.id,
  startDate: r.start_date,
  endDate: r.end_date,
  source: r.source,
});

export async function countCycles(db: Db): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM cycles');
  return row?.n ?? 0;
}

/** All cycles, oldest first. */
export async function getCycles(db: Db): Promise<Cycle[]> {
  const rows = await db.getAllAsync<Row>(
    'SELECT id, start_date, end_date, source FROM cycles ORDER BY start_date ASC',
  );
  return rows.map(fromRow);
}

/** The cycle with the latest start date, or null when there is none. */
export async function getLatestCycle(db: Db): Promise<Cycle | null> {
  const row = await db.getFirstAsync<Row>(
    'SELECT id, start_date, end_date, source FROM cycles ORDER BY start_date DESC LIMIT 1',
  );
  return row ? fromRow(row) : null;
}

/**
 * Each cycle ends the day before the next one starts; the latest cycle is still open (no end).
 * Run after any change to the list of cycles. Safe to run repeatedly.
 */
export async function recomputeCycleEnds(db: Db): Promise<void> {
  await db.runAsync(
    `UPDATE cycles SET end_date = (
       SELECT date(MIN(next.start_date), '-1 day') FROM cycles AS next
       WHERE next.start_date > cycles.start_date
     )`,
  );
}

/**
 * Starts a new cycle on `startDate` and closes the previous one. If a cycle already starts on
 * that date nothing is added. Returns the cycle that starts on `startDate`.
 */
export async function startCycle(
  db: Db,
  startDate: string,
  source: 'logged' | 'imported' = 'logged',
): Promise<Cycle> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('INSERT OR IGNORE INTO cycles (start_date, source) VALUES (?, ?)', [
      startDate,
      source,
    ]);
    await recomputeCycleEnds(db);
  });
  const row = await db.getFirstAsync<Row>(
    'SELECT id, start_date, end_date, source FROM cycles WHERE start_date = ?',
    [startDate],
  );
  return fromRow(row as Row);
}

/** Moves a cycle's start date and re-closes the neighbouring cycles. Returns false if no such id. */
export async function updateCycleStart(db: Db, id: number, newStart: string): Promise<boolean> {
  let found = false;
  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<{ id: number }>('SELECT id FROM cycles WHERE id = ?', [id]);
    if (!row) return;
    found = true;
    // Ends are derived from the starts, so clear them first: a moved start could otherwise land
    // after its old end date, which the table does not allow.
    await db.runAsync('UPDATE cycles SET end_date = NULL');
    await db.runAsync('UPDATE cycles SET start_date = ? WHERE id = ?', [newStart, id]);
    await recomputeCycleEnds(db);
  });
  return found;
}

/** Deletes a cycle (its day logs stay) and re-closes the remaining cycles. */
export async function deleteCycle(db: Db, id: number): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM cycles WHERE id = ?', [id]);
    await recomputeCycleEnds(db);
  });
}
