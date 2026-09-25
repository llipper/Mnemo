import { existsSync, accessSync, constants } from 'node:fs';
import type { DoctorCheck } from './domain/types.js';
import { commandExists } from './adapters/agent.js';
import { contextPaths } from './core/paths.js';

export function runDoctor(root: string): DoctorCheck[] {
  const paths = contextPaths(root);
  const checks: DoctorCheck[] = [
    { name: 'Node.js', ok: Number(process.versions.node.split('.')[0]) >= 22, detail: process.version, required: true },
    { name: 'Git', ok: commandExists('git'), detail: commandExists('git') ? 'available' : 'not found', required: false },
    ...(['codex', 'claude', 'gemini'] as const).map(name => ({ name, ok: commandExists(name), detail: commandExists(name) ? 'available' : 'not found', required: false })),
    { name: 'Configuration', ok: existsSync(paths.config), detail: paths.config, required: true },
    { name: 'Database', ok: existsSync(paths.database), detail: paths.database, required: true },
  ];
  try { accessSync(paths.dir, constants.R_OK | constants.W_OK); checks.push({ name: 'Context directory', ok: true, detail: 'readable and writable', required: true }); }
  catch { checks.push({ name: 'Context directory', ok: false, detail: 'not readable/writable', required: true }); }
  return checks;
}
