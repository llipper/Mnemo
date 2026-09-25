import { readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import { contextPaths } from './paths.js';

export const configSchema = z.object({
  version: z.literal(1),
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  contextBudget: z.number().int().min(256).max(32000).default(2000),
  defaultAgent: z.enum(['auto', 'codex', 'claude', 'gemini']).default('auto'),
  memoryEngine: z.object({ mode: z.enum(['rules', 'existing-agent', 'ollama']).default('rules') }).default({ mode: 'rules' }),
});
export type MnemoConfig = z.infer<typeof configSchema>;

export function readConfig(root: string): MnemoConfig {
  return configSchema.parse(JSON.parse(readFileSync(contextPaths(root).config, 'utf8')));
}

export function writeConfig(root: string, config: MnemoConfig): void {
  writeFileSync(contextPaths(root).config, `${JSON.stringify(configSchema.parse(config), null, 2)}\n`, { mode: 0o600 });
}
