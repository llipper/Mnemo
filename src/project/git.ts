import { execFileSync } from 'node:child_process';

export function git(root: string, args: string[]): string | null {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 10_000 }).trim();
  } catch { return null; }
}

export function gitSnapshot(root: string) {
  return {
    head: git(root, ['rev-parse', 'HEAD']),
    branch: git(root, ['branch', '--show-current']),
    status: git(root, ['status', '--short', '--untracked-files=all']) ?? '',
    diffStat: git(root, ['diff', '--stat', 'HEAD']) ?? '',
  };
}
