export const schema = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  root TEXT NOT NULL UNIQUE,
  profile_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('FACT','DECISION','CONSTRAINT','TASK','FAILURE','ASSUMPTION')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ACTIVE','COMPLETED','SUPERSEDED','REJECTED')),
  scope TEXT NOT NULL DEFAULT 'project',
  importance INTEGER NOT NULL DEFAULT 50 CHECK(importance BETWEEN 0 AND 100),
  superseded_by TEXT REFERENCES memories(id),
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;
CREATE INDEX IF NOT EXISTS memories_lookup ON memories(project_id, kind, status, importance DESC, updated_at DESC);

CREATE TABLE IF NOT EXISTS decisions (memory_id TEXT PRIMARY KEY REFERENCES memories(id) ON DELETE CASCADE) STRICT;
CREATE TABLE IF NOT EXISTS constraints (memory_id TEXT PRIMARY KEY REFERENCES memories(id) ON DELETE CASCADE) STRICT;
CREATE TABLE IF NOT EXISTS tasks (memory_id TEXT PRIMARY KEY REFERENCES memories(id) ON DELETE CASCADE) STRICT;
CREATE TABLE IF NOT EXISTS failures (memory_id TEXT PRIMARY KEY REFERENCES memories(id) ON DELETE CASCADE) STRICT;

CREATE TABLE IF NOT EXISTS checkpoints (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT,
  git_head TEXT,
  git_branch TEXT,
  git_status TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL
) STRICT;
CREATE INDEX IF NOT EXISTS checkpoints_project ON checkpoints(project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
) STRICT;
CREATE INDEX IF NOT EXISTS events_project ON events(project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE(project_id, type, name)
) STRICT;

CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}'
) STRICT;

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  locator TEXT NOT NULL,
  fingerprint TEXT,
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS context_packages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  budget INTEGER NOT NULL,
  token_estimate INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
) STRICT;
`;
