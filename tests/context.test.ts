import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { schema } from '../src/database/schema.js';
import { Repository } from '../src/database/repository.js';
import { compileContext } from '../src/context/compiler.js';

describe('compileContext', () => {
  it('prioritizes constraints while respecting the token budget', () => {
    const db = new Database(':memory:'); db.exec(schema);
    const repo = new Repository(db, 'p1');
    db.prepare('INSERT INTO projects(id,name,root,profile_json,created_at,updated_at) VALUES(?,?,?,?,?,?)').run('p1', 'demo', '/demo', '{}', new Date().toISOString(), new Date().toISOString());
    repo.add('CONSTRAINT', 'Offline', 'The core must work without a network connection.', { importance: 100 });
    repo.add('DECISION', 'Database', 'Use SQLite.', { importance: 80 });
    const result = compileContext(repo, { root: '/demo', name: 'demo', projectType: ['Node.js'], languages: ['TypeScript'], packageManager: 'pnpm', hasGit: false, defaultBranch: null, head: null, importantDirectories: ['src'], infrastructure: [] }, 500);
    expect(result.tokenEstimate).toBeLessThanOrEqual(500);
    expect(result.markdown).toContain('The core must work without a network connection.');
    db.close();
  });
});
