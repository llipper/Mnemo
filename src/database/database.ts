import Database from 'better-sqlite3';
import { schema } from './schema.js';

export type SqliteDatabase = Database.Database;

export function openDatabase(path: string): SqliteDatabase {
  const db = new Database(path, { timeout: 5000 });
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.exec(schema);
  db.prepare('INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (?, ?)').run(1, new Date().toISOString());
  return db;
}
