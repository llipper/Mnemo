import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { contextPaths } from './paths.js';
import { writeConfig, readConfig } from './config.js';
import { openDatabase } from '../database/database.js';
import type { SqliteDatabase } from '../database/database.js';
import { Repository } from '../database/repository.js';
import { detectProject } from '../project/detector.js';
import type { ProjectProfile } from '../domain/types.js';
import type { MnemoConfig } from './config.js';

export interface MnemoRuntime {
  root: string;
  config: MnemoConfig;
  paths: ReturnType<typeof contextPaths>;
  db: SqliteDatabase;
  repository: Repository;
  profile: ProjectProfile;
}

export function initialize(rootInput: string, options: { name?: string; budget?: number } = {}) {
  const root = resolve(rootInput);
  const paths = contextPaths(root);
  if (existsSync(paths.config)) throw new Error(`Mnemo is already initialized at ${root}`);
  mkdirSync(paths.logs, { recursive: true });
  const profile = detectProject(root);
  const config = {
    version: 1 as const, projectId: randomUUID(), projectName: options.name ?? profile.name ?? basename(root),
    contextBudget: options.budget ?? 2000, defaultAgent: 'auto' as const, memoryEngine: { mode: 'rules' as const },
  };
  writeConfig(root, config);
  writeFileSync(paths.state, `${JSON.stringify({ initializedAt: new Date().toISOString(), lastAgent: null, lastCheckpoint: null }, null, 2)}\n`, { mode: 0o600 });
  const db = openDatabase(paths.database);
  const repository = new Repository(db, config.projectId);
  repository.upsertProject(config.projectName, root, profile);
  repository.event('PROJECT_INITIALIZED', { root, name: config.projectName });
  db.close();
  const gitignore = join(root, '.gitignore');
  if (!existsSync(gitignore)) writeFileSync(gitignore, '.context/\n');
  return { root, config, profile };
}

export function openRuntime(root: string): MnemoRuntime {
  const config = readConfig(root);
  const paths = contextPaths(root);
  const db = openDatabase(paths.database);
  const repository = new Repository(db, config.projectId);
  const profile = detectProject(root);
  repository.upsertProject(config.projectName, root, profile);
  return { root, config, paths, db, repository, profile };
}
