import { randomUUID } from 'node:crypto';

const prefixes: Record<string, string> = {
  DECISION: 'D', CONSTRAINT: 'C', TASK: 'T', FAILURE: 'F', FACT: 'M', ASSUMPTION: 'A', CHECKPOINT: 'CP', EVENT: 'E', CONTEXT: 'CTX',
};

export function createId(kind: string): string {
  return `${prefixes[kind] ?? kind}-${randomUUID().slice(0, 8).toUpperCase()}`;
}
