import { spawn, spawnSync } from 'node:child_process';
import type { Repository } from '../database/repository.js';
import { createCheckpoint } from '../checkpoints/service.js';

export type AgentName = 'codex' | 'claude' | 'gemini';
interface Adapter { name: AgentName; command: string; args(context: string): string[] }

const adapters: Record<AgentName, Adapter> = {
  codex: { name: 'codex', command: 'codex', args: context => ['--no-alt-screen', context] },
  claude: { name: 'claude', command: 'claude', args: context => [context] },
  gemini: { name: 'gemini', command: 'gemini', args: context => ['-i', context] },
};

export function commandExists(command: string): boolean {
  const probe = process.platform === 'win32' ? 'where.exe' : 'which';
  return spawnSync(probe, [command], { stdio: 'ignore' }).status === 0;
}

export function availableAgents(): AgentName[] {
  return (Object.keys(adapters) as AgentName[]).filter(name => commandExists(adapters[name].command));
}

export async function startAgent(name: AgentName, root: string, context: string, repository: Repository): Promise<number> {
  const adapter = adapters[name];
  if (!commandExists(adapter.command)) throw new Error(`${name} CLI was not found in PATH.`);
  repository.event('AGENT_SESSION_STARTED', { agent: name });
  const exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn(adapter.command, adapter.args(context), { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
    child.once('error', reject); child.once('exit', code => resolve(code ?? 1));
  });
  repository.event('AGENT_SESSION_FINISHED', { agent: name, exitCode });
  createCheckpoint(root, repository, `After ${name} session`);
  return exitCode;
}
