import * as SQLite from 'expo-sqlite';

import { migrations } from './migrations';
import { runMigrations } from './runMigrations';
import type { Db } from './types';

type Params = (string | number | null)[];

/** Adapts expo-sqlite's database to our small Db interface. */
function adapt(db: SQLite.SQLiteDatabase): Db {
  return {
    execAsync: (sql) => db.execAsync(sql),
    runAsync: (sql, params: Params = []) => db.runAsync(sql, params),
    getAllAsync: <T>(sql: string, params: Params = []) => db.getAllAsync<T>(sql, params),
    getFirstAsync: <T>(sql: string, params: Params = []) => db.getFirstAsync<T>(sql, params),
    withTransactionAsync: (task) => db.withTransactionAsync(task),
  };
}

async function open(): Promise<Db> {
  const raw = await SQLite.openDatabaseAsync('peri.db');
  await raw.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const db = adapt(raw);
  await runMigrations(db, migrations);
  return db;
}

let dbPromise: Promise<Db> | undefined;

/** Opens the on-device database once and applies pending migrations. */
export function getDb(): Promise<Db> {
  dbPromise ??= open();
  return dbPromise;
}

export type { Db, Migration } from './types';
