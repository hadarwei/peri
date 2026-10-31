import { runMigrations } from './runMigrations';
import type { Db, Migration } from './types';

/** Minimal in-memory fake: remembers executed SQL and the migrations table; rolls back on error. */
function fakeDb() {
  let rows: { version: number; name: string }[] = [];
  let executed: string[] = [];
  const db: Db = {
    async execAsync(sql) {
      if (sql.includes('BOOM')) throw new Error('boom');
      executed.push(sql);
    },
    async runAsync(_sql, params) {
      rows.push({ version: params![0] as number, name: params![1] as string });
    },
    async getAllAsync() {
      return [] as never[];
    },
    async getFirstAsync<T>() {
      const v = rows.length ? Math.max(...rows.map((r) => r.version)) : null;
      return { v } as T;
    },
    async withTransactionAsync(task) {
      const snapshot = { rows: [...rows], executed: [...executed] };
      try {
        await task();
      } catch (e) {
        rows = snapshot.rows;
        executed = snapshot.executed;
        throw e;
      }
    },
  };
  return {
    db,
    get rows() {
      return rows;
    },
    get executed() {
      return executed;
    },
  };
}

const m = (version: number, sql = `SQL${version}`): Migration => ({
  version,
  name: `m${version}`,
  sql,
});

describe('runMigrations', () => {
  it('applies pending migrations in order', async () => {
    const f = fakeDb();
    expect(await runMigrations(f.db, [m(1), m(2)])).toEqual([1, 2]);
    expect(f.executed.filter((s) => s.startsWith('SQL'))).toEqual(['SQL1', 'SQL2']);
  });

  it('skips migrations that were already applied', async () => {
    const f = fakeDb();
    await runMigrations(f.db, [m(1)]);
    expect(await runMigrations(f.db, [m(1), m(2)])).toEqual([2]);
  });

  it('rolls back a failing migration and stops at the last good version', async () => {
    const f = fakeDb();
    await expect(runMigrations(f.db, [m(1), m(2, 'BOOM')])).rejects.toThrow('boom');
    expect(f.rows.map((r) => r.version)).toEqual([1]);
  });

  it('rejects duplicate or unordered versions', async () => {
    await expect(runMigrations(fakeDb().db, [m(2), m(1)])).rejects.toThrow('strictly increasing');
    await expect(runMigrations(fakeDb().db, [m(1), m(1)])).rejects.toThrow('strictly increasing');
  });
});
