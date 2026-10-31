import { DatabaseSync } from 'node:sqlite';

import { migrations } from '../migrations';
import { runMigrations } from '../runMigrations';
import type { Db } from '../types';

type Params = (string | number | null)[];

/** TEST ONLY: our Db interface on top of Node's built-in SQLite (in memory). */
export async function createTestDb(): Promise<Db> {
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  const db: Db = {
    async execAsync(sql) {
      raw.exec(sql);
    },
    async runAsync(sql, params: Params = []) {
      return raw.prepare(sql).run(...params);
    },
    async getAllAsync<T>(sql: string, params: Params = []) {
      return raw.prepare(sql).all(...params) as T[];
    },
    async getFirstAsync<T>(sql: string, params: Params = []) {
      return (raw.prepare(sql).get(...params) as T | undefined) ?? null;
    },
    async withTransactionAsync(task) {
      raw.exec('BEGIN');
      try {
        await task();
        raw.exec('COMMIT');
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
  };
  await runMigrations(db, migrations);
  return db;
}
