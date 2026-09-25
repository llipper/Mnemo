import type { ContextPackage, MemoryRecord, ProjectProfile } from '../domain/types.js';
import type { Repository } from '../database/repository.js';

export const estimateTokens = (text: string) => Math.ceil(text.length / 4);
const recordLine = (r: MemoryRecord) => `- [${r.id}] ${r.title}: ${r.content}`;

export function compileContext(repository: Repository, project: ProjectProfile, budget: number, query?: string): ContextPackage {
  const currentTask = repository.list({ kind: 'TASK', status: 'ACTIVE', limit: 1 })[0] ?? null;
  const pools = {
    constraints: repository.list({ kind: 'CONSTRAINT', status: 'ACTIVE', limit: 50, ...(query ? { search: query } : {}) }),
    decisions: repository.list({ kind: 'DECISION', status: 'ACTIVE', limit: 50, ...(query ? { search: query } : {}) }),
    failures: repository.list({ kind: 'FAILURE', status: 'ACTIVE', limit: 30, ...(query ? { search: query } : {}) }),
    facts: repository.list({ kind: 'FACT', status: 'ACTIVE', limit: 30, ...(query ? { search: query } : {}) }),
  };
  const sections: string[] = [
    '# MNEMO PROJECT CONTEXT',
    '', `Generated: ${new Date().toISOString()}`,
    '', '## Project', `- Name: ${project.name}`, `- Root: ${project.root}`, `- Type: ${project.projectType.join(', ') || 'Unknown'}`, `- Languages: ${project.languages.join(', ') || 'Unknown'}`, `- Git: ${project.hasGit ? `${project.defaultBranch ?? 'detached'} @ ${project.head?.slice(0, 8) ?? 'unknown'}` : 'No'}`,
  ];
  if (currentTask) sections.push('', '## Current task', recordLine(currentTask));
  const selected = { constraints: [] as MemoryRecord[], decisions: [] as MemoryRecord[], failures: [] as MemoryRecord[], facts: [] as MemoryRecord[] };
  for (const key of ['constraints', 'decisions', 'failures', 'facts'] as const) {
    if (!pools[key].length) continue;
    const heading = key[0]!.toUpperCase() + key.slice(1);
    const block: string[] = ['', `## ${heading}`];
    for (const record of pools[key]) {
      const candidate = [...sections, ...block, recordLine(record)].join('\n');
      if (estimateTokens(candidate) > budget) break;
      block.push(recordLine(record)); selected[key].push(record);
    }
    if (block.length > 2) sections.push(...block);
  }
  const lastCheckpoint = repository.lastCheckpoint();
  if (lastCheckpoint) {
    const block = ['', '## Last checkpoint', `- ${lastCheckpoint.id} (${lastCheckpoint.createdAt}): ${lastCheckpoint.summary}`];
    if (estimateTokens([...sections, ...block].join('\n')) <= budget) sections.push(...block);
  }
  sections.push('', 'Use this as continuity context. Verify mutable facts against the repository before acting.');
  const markdown = sections.join('\n');
  const result: ContextPackage = { generatedAt: new Date().toISOString(), project, currentTask, ...selected, lastCheckpoint, tokenEstimate: estimateTokens(markdown), budget, markdown };
  repository.saveContext(markdown, budget, result.tokenEstimate);
  return result;
}
