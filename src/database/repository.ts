import type { SqliteDatabase } from './database.js';
import type { Checkpoint, MemoryKind, MemoryRecord, ProjectProfile, RecordStatus } from '../domain/types.js';
import { createId } from '../core/ids.js';
import { sanitize } from '../security/sanitizer.js';

interface MemoryRow {
  id: string; project_id: string; kind: MemoryKind; title: string; content: string; status: RecordStatus;
  scope: string; importance: number; created_at: string; updated_at: string; superseded_by: string | null; source: string | null;
}
const toMemory = (r: MemoryRow): MemoryRecord => ({
  id: r.id, projectId: r.project_id, kind: r.kind, title: r.title, content: r.content, status: r.status,
  scope: r.scope, importance: r.importance, createdAt: r.created_at, updatedAt: r.updated_at, supersededBy: r.superseded_by, source: r.source,
});

export class Repository {
  constructor(private readonly db: SqliteDatabase, readonly projectId: string) {}

  upsertProject(name: string, root: string, profile: ProjectProfile): void {
    const now = new Date().toISOString();
    this.db.prepare(`INSERT INTO projects(id,name,root,profile_json,created_at,updated_at) VALUES(?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name,root=excluded.root,profile_json=excluded.profile_json,updated_at=excluded.updated_at`)
      .run(this.projectId, name, root, JSON.stringify(profile), now, now);
  }

  add(kind: MemoryKind, title: string, content: string, options: { scope?: string; importance?: number; source?: string } = {}): MemoryRecord {
    const now = new Date().toISOString();
    const cleanTitle = sanitize(title).value;
    const cleanContent = sanitize(content).value;
    const id = createId(kind);
    this.db.prepare(`INSERT INTO memories(id,project_id,kind,title,content,status,scope,importance,source,created_at,updated_at)
      VALUES(?,?,?,?,?,'ACTIVE',?,?,?,?,?)`).run(id, this.projectId, kind, cleanTitle, cleanContent, options.scope ?? 'project', options.importance ?? 50, options.source ?? 'manual', now, now);
    const mirror: Partial<Record<MemoryKind, string>> = { DECISION: 'decisions', CONSTRAINT: 'constraints', TASK: 'tasks', FAILURE: 'failures' };
    const table = mirror[kind];
    if (table) this.db.prepare(`INSERT INTO ${table}(memory_id) VALUES(?)`).run(id);
    this.event(`${kind}_CREATED`, { id, title: cleanTitle });
    return this.get(id)!;
  }

  get(id: string): MemoryRecord | null {
    const row = this.db.prepare('SELECT * FROM memories WHERE project_id=? AND id=?').get(this.projectId, id) as MemoryRow | undefined;
    return row ? toMemory(row) : null;
  }

  list(options: { kind?: MemoryKind; status?: RecordStatus; limit?: number; search?: string } = {}): MemoryRecord[] {
    const clauses = ['project_id = ?'];
    const params: unknown[] = [this.projectId];
    if (options.kind) { clauses.push('kind = ?'); params.push(options.kind); }
    if (options.status) { clauses.push('status = ?'); params.push(options.status); }
    if (options.search) { clauses.push('(title LIKE ? OR content LIKE ? OR scope LIKE ?)'); const q = `%${options.search}%`; params.push(q, q, q); }
    params.push(options.limit ?? 100);
    return (this.db.prepare(`SELECT * FROM memories WHERE ${clauses.join(' AND ')} ORDER BY importance DESC, updated_at DESC LIMIT ?`).all(...params) as MemoryRow[]).map(toMemory);
  }

  setStatus(id: string, status: RecordStatus, supersededBy?: string): MemoryRecord {
    const result = this.db.prepare('UPDATE memories SET status=?, superseded_by=?, updated_at=? WHERE project_id=? AND id=?')
      .run(status, supersededBy ?? null, new Date().toISOString(), this.projectId, id);
    if (!result.changes) throw new Error(`Memory not found: ${id}`);
    this.event('MEMORY_STATUS_CHANGED', { id, status, supersededBy });
    return this.get(id)!;
  }

  event(type: string, payload: unknown): void {
    const clean = sanitize(JSON.stringify(payload)).value;
    this.db.prepare('INSERT INTO events(id,project_id,type,payload_json,created_at) VALUES(?,?,?,?,?)')
      .run(createId('EVENT'), this.projectId, type, clean, new Date().toISOString());
  }

  addCheckpoint(input: Omit<Checkpoint, 'id' | 'projectId' | 'createdAt'>): Checkpoint {
    const checkpoint: Checkpoint = { ...input, id: createId('CHECKPOINT'), projectId: this.projectId, createdAt: new Date().toISOString() };
    this.db.prepare('INSERT INTO checkpoints(id,project_id,label,git_head,git_branch,git_status,summary,created_at) VALUES(?,?,?,?,?,?,?,?)')
      .run(checkpoint.id, checkpoint.projectId, checkpoint.label, checkpoint.gitHead, checkpoint.gitBranch, sanitize(checkpoint.gitStatus).value, sanitize(checkpoint.summary).value, checkpoint.createdAt);
    this.event('CHECKPOINT_CREATED', { id: checkpoint.id, label: checkpoint.label });
    return checkpoint;
  }

  lastCheckpoint(): Checkpoint | null {
    const r = this.db.prepare('SELECT * FROM checkpoints WHERE project_id=? ORDER BY created_at DESC LIMIT 1').get(this.projectId) as Record<string, unknown> | undefined;
    return r ? { id: r.id as string, projectId: r.project_id as string, label: r.label as string | null, gitHead: r.git_head as string | null, gitBranch: r.git_branch as string | null, gitStatus: r.git_status as string, summary: r.summary as string, createdAt: r.created_at as string } : null;
  }

  history(limit = 30): Array<{ id: string; type: string; payload: unknown; createdAt: string }> {
    const rows = this.db.prepare('SELECT id,type,payload_json,created_at FROM events WHERE project_id=? ORDER BY created_at DESC LIMIT ?').all(this.projectId, limit) as Array<Record<string, string>>;
    return rows.map(r => ({ id: r.id!, type: r.type!, payload: JSON.parse(r.payload_json!), createdAt: r.created_at! }));
  }

  saveContext(content: string, budget: number, tokenEstimate: number): void {
    this.db.prepare('INSERT INTO context_packages(id,project_id,budget,token_estimate,content,created_at) VALUES(?,?,?,?,?,?)')
      .run(createId('CONTEXT'), this.projectId, budget, tokenEstimate, content, new Date().toISOString());
  }
}
