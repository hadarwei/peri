import { DatabaseSync } from 'node:sqlite';

import { migrations } from './migrations';

// Runs the real migration SQL on a real (in-memory) SQLite engine, no device needed.
function freshDb() {
  const db = new DatabaseSync(':memory:');
  for (const m of migrations) db.exec(m.sql);
  return db;
}

describe('schema 001', () => {
  it('creates all six tables', () => {
    const rows = freshDb()
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all() as { name: string }[];
    expect(rows.map((r) => r.name).sort()).toEqual(
      ['checkins', 'cycles', 'day_logs', 'settings', 'temperature_readings', 'test_photos'].sort(),
    );
  });

  it('rejects an out-of-range mood', () => {
    const db = freshDb();
    expect(() =>
      db
        .prepare("INSERT INTO day_logs (date, mood, updated_at) VALUES ('2026-01-01', 9, 'x')")
        .run(),
    ).toThrow();
  });

  it('rejects a cycle that ends before it starts and duplicate start dates', () => {
    const db = freshDb();
    expect(() =>
      db
        .prepare("INSERT INTO cycles (start_date, end_date) VALUES ('2026-01-10', '2026-01-05')")
        .run(),
    ).toThrow();
    db.prepare("INSERT INTO cycles (start_date) VALUES ('2026-01-10')").run();
    expect(() =>
      db.prepare("INSERT INTO cycles (start_date) VALUES ('2026-01-10')").run(),
    ).toThrow();
  });

  it('rejects an implausible temperature and a bad test result', () => {
    const db = freshDb();
    expect(() =>
      db
        .prepare(
          "INSERT INTO temperature_readings (date, celsius, measured_at) VALUES ('2026-01-01', 50, 'x')",
        )
        .run(),
    ).toThrow();
    expect(() =>
      db
        .prepare(
          "INSERT INTO test_photos (id, date, file_path, result, created_at) VALUES ('a','2026-01-01','p','maybe','x')",
        )
        .run(),
    ).toThrow();
  });
});
