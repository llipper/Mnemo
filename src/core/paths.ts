import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { MnemoError } from './errors.js';

export const CONTEXT_DIR = '.context';

export function findProjectRoot(start = process.cwd()): string | null {
  let current = resolve(start);
  while (true) {
    if (existsSync(join(current, CONTEXT_DIR, 'config.json'))) return current;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export function requireProjectRoot(start = process.cwd()): string {
  const root = findProjectRoot(start);
  if (!root) throw new MnemoError('Mnemo is not initialized here. Run `ctx init` first.', 2);
  return root;
}

export const contextPaths = (root: string) => ({
  dir: join(root, CONTEXT_DIR),
  database: join(root, CONTEXT_DIR, 'context.db'),
  config: join(root, CONTEXT_DIR, 'config.json'),
  state: join(root, CONTEXT_DIR, 'state.json'),
  logs: join(root, CONTEXT_DIR, 'logs'),
});
