import type { Migration } from '../types';

// All dates are local calendar dates as TEXT 'YYYY-MM-DD'. Timestamps are ISO strings.
export const m001: Migration = {
  version: 1,
  name: 'initial schema',
  sql: `
    CREATE TABLE cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_date TEXT NOT NULL UNIQUE,
      end_date TEXT,
      source TEXT NOT NULL DEFAULT 'logged' CHECK (source IN ('logged', 'imported')),
      CHECK (end_date IS NULL OR end_date >= start_date)
    );
    CREATE INDEX idx_cycles_start ON cycles (start_date);

    CREATE TABLE day_logs (
      date TEXT PRIMARY KEY,
      flow INTEGER CHECK (flow IS NULL OR flow BETWEEN 0 AND 3),
      mood INTEGER CHECK (mood IS NULL OR mood BETWEEN 1 AND 5),
      pain INTEGER CHECK (pain IS NULL OR pain BETWEEN 0 AND 10),
      energy INTEGER CHECK (energy IS NULL OR energy BETWEEN 1 AND 5),
      symptoms TEXT NOT NULL DEFAULT '[]',
      note TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE temperature_readings (
      date TEXT PRIMARY KEY,
      celsius REAL NOT NULL CHECK (celsius BETWEEN 30 AND 45),
      measured_at TEXT NOT NULL,
      unusual INTEGER NOT NULL DEFAULT 0 CHECK (unusual IN (0, 1)),
      note TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE test_photos (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      file_path TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'lh' CHECK (kind IN ('lh', 'other')),
      result TEXT CHECK (result IS NULL OR result IN ('negative', 'faint', 'positive')),
      created_at TEXT NOT NULL
    );
    CREATE INDEX idx_test_photos_date ON test_photos (date);

    CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE checkins (
      date TEXT PRIMARY KEY
    );
  `,
};
