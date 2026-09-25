import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { requireProjectRoot } from '../core/paths.js';
import { openRuntime } from '../core/runtime.js';
import { compileContext } from '../context/compiler.js';
import { createCheckpoint } from '../checkpoints/service.js';
import { memoryKinds } from '../domain/types.js';

export async function serveMcp(start = process.cwd()): Promise<void> {
  const root = requireProjectRoot(start);
  const runtime = openRuntime(root);
  const server = new McpServer({ name: 'mnemo', version: '0.1.0' });
  const output = (value: unknown) => ({ content: [{ type: 'text' as const, text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] });

  server.registerTool('project_state', { description: 'Get the current Mnemo project profile and active task.' }, async () => output({ project: runtime.profile, currentTask: runtime.repository.list({ kind: 'TASK', status: 'ACTIVE', limit: 1 })[0] ?? null, checkpoint: runtime.repository.lastCheckpoint() }));
  server.registerTool('project_context', { description: 'Compile relevant project context within a token budget.', inputSchema: { query: z.string().optional(), budget: z.number().int().min(256).max(32000).optional() } }, async ({ query, budget }) => output(compileContext(runtime.repository, runtime.profile, budget ?? runtime.config.contextBudget, query).markdown));
  server.registerTool('memory_search', { description: 'Search project memory.', inputSchema: { query: z.string().min(1), kind: z.enum(memoryKinds).optional(), limit: z.number().int().min(1).max(100).optional() } }, async ({ query, kind, limit }) => output(runtime.repository.list({ search: query, ...(kind ? { kind } : {}), limit: limit ?? 20 })));
  server.registerTool('memory_get', { description: 'Get one memory record by ID.', inputSchema: { id: z.string().min(1) } }, async ({ id }) => output(runtime.repository.get(id) ?? { error: 'Not found' }));
  server.registerTool('report_memory', { description: 'Persist a sanitized fact, decision, constraint, task, failure or assumption.', inputSchema: { kind: z.enum(memoryKinds), title: z.string().min(1), content: z.string().min(1), scope: z.string().optional(), importance: z.number().int().min(0).max(100).optional() } }, async ({ kind, title, content, scope, importance }) => output(runtime.repository.add(kind, title, content, { ...(scope ? { scope } : {}), ...(importance === undefined ? {} : { importance }), source: 'mcp' })));
  server.registerTool('memory_checkpoint', { description: 'Create a Git-aware project checkpoint.', inputSchema: { label: z.string().optional() } }, async ({ label }) => output(createCheckpoint(root, runtime.repository, label)));

  const transport = new StdioServerTransport();
  const shutdown = () => { runtime.db.close(); };
  process.once('SIGINT', shutdown); process.once('SIGTERM', shutdown);
  await server.connect(transport);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  serveMcp().catch(error => { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; });
}
