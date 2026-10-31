import type { Db, Migration } from './types';

function assertValid(migrations: Migration[]): void {
  for (let i = 0; i < migrations.length; i++) {
    const m = migrations[i];
    if (!Number.isInteger(m.version) || m.version < 1) {
      throw new Error(`Invalid migration version: ${m.version}`);
    }
    if (i > 0 && m.version <= migrations[i - 1].version) {
      throw new Error(
        `Migrations must be strictly increasing: ${m.version} after ${migrations[i - 1].version}`,
      );
    }
  }
}

/**
 * Applies pending migrations in order. Each migration and its bookkeeping row run in one
 * transaction, so a failure leaves the database at the last good version.
 * Returns the versions applied in this call.
 */
export async function runMigrations(db: Db, migrations: Migration[]): Promise<number[]> {
  assertValid(migrations);

  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)',
  );
  const row = await db.getFirstAsync<{ v: number | null }>(
    'SELECT MAX(version) AS v FROM migrations',
  );
  const current = row?.v ?? 0;

  const applied: number[] = [];
  for (const m of migrations.filter((x) => x.version > current)) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(m.sql);
      await db.runAsync('INSERT INTO migrations (version, name, applied_at) VALUES (?, ?, ?)', [
        m.version,
        m.name,
        new Date().toISOString(),
      ]);
    });
    applied.push(m.version);
  }
  return applied;
}
