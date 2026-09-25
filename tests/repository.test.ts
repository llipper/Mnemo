import Database from 'better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';
import { schema } from '../src/database/schema.js';
import { Repository } from '../src/database/repository.js';

const databases: Database.Database[] = [];
function repository() {
  const db = new Database(':memory:'); databases.push(db); db.exec(schema);
  const repo = new Repository(db, 'project-test');
  db.prepare('INSERT INTO projects(id,name,root,profile_json,created_at,updated_at) VALUES(?,?,?,?,?,?)').run('project-test', 'test', '/test', '{}', new Date().toISOString(), new Date().toISOString());
  return repo;
}
afterEach(() => databases.splice(0).forEach(db => db.close()));

describe('Repository', () => {
  it('stores and retrieves a sanitized decision', () => {
    const repo = repository();
    const decision = repo.add('DECISION', 'Database', 'Use SQLite. api_key=super-secret-value');
    expect(decision.id).toMatch(/^D-/);
    expect(decision.content).toContain('[REDACTED:generic-secret]');
    expect(repo.list({ kind: 'DECISION', status: 'ACTIVE' })).toHaveLength(1);
  });

  it('preserves supersession history', () => {
    const repo = repository();
    const oldRecord = repo.add('DECISION', 'Database', 'Use file storage');
    const replacement = repo.add('DECISION', 'Database v2', 'Use SQLite');
    const updated = repo.setStatus(oldRecord.id, 'SUPERSEDED', replacement.id);
    expect(updated.status).toBe('SUPERSEDED');
    expect(updated.supersededBy).toBe(replacement.id);
  });
});
