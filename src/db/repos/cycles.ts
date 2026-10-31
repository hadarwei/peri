import type { Db } from '../types';

export async function countCycles(db: Db): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM cycles');
  return row?.n ?? 0;
}
