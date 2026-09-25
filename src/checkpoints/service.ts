import type { Repository } from '../database/repository.js';
import { gitSnapshot } from '../project/git.js';

export function createCheckpoint(root: string, repository: Repository, label?: string) {
  const snapshot = gitSnapshot(root);
  const changed = snapshot.status.split(/\r?\n/).filter(Boolean);
  const summary = changed.length ? `${changed.length} changed path(s).${snapshot.diffStat ? `\n${snapshot.diffStat}` : ''}` : 'Working tree unchanged.';
  return repository.addCheckpoint({ label: label ?? null, gitHead: snapshot.head, gitBranch: snapshot.branch, gitStatus: snapshot.status, summary });
}
