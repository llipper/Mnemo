export const memoryKinds = ['FACT', 'DECISION', 'CONSTRAINT', 'TASK', 'FAILURE', 'ASSUMPTION'] as const;
export type MemoryKind = (typeof memoryKinds)[number];
export type RecordStatus = 'ACTIVE' | 'COMPLETED' | 'SUPERSEDED' | 'REJECTED';

export interface MemoryRecord {
  id: string;
  projectId: string;
  kind: MemoryKind;
  title: string;
  content: string;
  status: RecordStatus;
  scope: string;
  importance: number;
  createdAt: string;
  updatedAt: string;
  supersededBy: string | null;
  source: string | null;
}

export interface ProjectProfile {
  root: string;
  name: string;
  projectType: string[];
  languages: string[];
  packageManager: string | null;
  hasGit: boolean;
  defaultBranch: string | null;
  head: string | null;
  importantDirectories: string[];
  infrastructure: string[];
}

export interface ContextPackage {
  generatedAt: string;
  project: ProjectProfile;
  currentTask: MemoryRecord | null;
  constraints: MemoryRecord[];
  decisions: MemoryRecord[];
  failures: MemoryRecord[];
  facts: MemoryRecord[];
  lastCheckpoint: Checkpoint | null;
  tokenEstimate: number;
  budget: number;
  markdown: string;
}

export interface Checkpoint {
  id: string;
  projectId: string;
  label: string | null;
  gitHead: string | null;
  gitBranch: string | null;
  gitStatus: string;
  summary: string;
  createdAt: string;
}

export interface DoctorCheck {
  name: string;
  ok: boolean;
  detail: string;
  required: boolean;
}
