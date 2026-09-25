import { Command } from 'commander';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { initialize, openRuntime } from './core/runtime.js';
import { requireProjectRoot, findProjectRoot } from './core/paths.js';
import { compileContext } from './context/compiler.js';
import { createCheckpoint } from './checkpoints/service.js';
import { availableAgents, startAgent, type AgentName } from './adapters/agent.js';
import { runDoctor } from './doctor.js';
import { serveMcp } from './mcp/server.js';
import type { MemoryKind, RecordStatus } from './domain/types.js';

const program = new Command();
program.name('ctx').description('Mnemo — local-first project memory for coding agents').version('0.1.0').showHelpAfterError();

function withRuntime<T>(fn: (runtime: ReturnType<typeof openRuntime>) => T): T {
  const runtime = openRuntime(requireProjectRoot());
  try { return fn(runtime); } finally { runtime.db.close(); }
}
const printRecord = (r: { id: string; title: string; content: string; status: string }) => console.log(`${pc.cyan(r.id)} ${pc.dim(`[${r.status}]`)} ${pc.bold(r.title)}\n  ${r.content}`);

program.command('init').description('Initialize Mnemo in a project').option('-n, --name <name>').option('-b, --context-budget <tokens>', 'default context budget', '2000').action(options => {
  const result = initialize(process.cwd(), { ...(options.name ? { name: options.name } : {}), budget: Number(options.contextBudget) });
  console.log(`${pc.green('✓')} Mnemo initialized for ${pc.bold(result.config.projectName)}\n  ${result.root}`);
});

function addMemoryCommand(name: string, kind: MemoryKind, description: string) {
  program.command(name).description(description).argument('<title>').argument('[content]').option('-s, --scope <scope>', 'memory scope', 'project').option('-i, --importance <number>', '0-100', '50').action((title, content, options) => {
    withRuntime(runtime => {
      const record = runtime.repository.add(kind, title, content ?? title, { scope: options.scope, importance: Number(options.importance), source: 'cli' });
      console.log(`${pc.green('✓')} ${kind.toLowerCase()} recorded as ${pc.cyan(record.id)}`);
    });
  });
}
addMemoryCommand('remember', 'FACT', 'Record a project fact');
addMemoryCommand('decide', 'DECISION', 'Record an architectural or product decision');
addMemoryCommand('constrain', 'CONSTRAINT', 'Record a constraint');
addMemoryCommand('task', 'TASK', 'Record an active task');
addMemoryCommand('fail', 'FAILURE', 'Record a failed approach and its resolution');
addMemoryCommand('assume', 'ASSUMPTION', 'Record an assumption that still needs verification');

program.command('complete').description('Mark a memory or task completed').argument('<id>').action(id => withRuntime(runtime => printRecord(runtime.repository.setStatus(id, 'COMPLETED'))));
program.command('supersede').description('Supersede a memory with another record').argument('<id>').argument('<replacement-id>').action((id, replacementId) => withRuntime(runtime => printRecord(runtime.repository.setStatus(id, 'SUPERSEDED', replacementId))));

program.command('list').description('List memories').option('-k, --kind <kind>').option('-s, --status <status>', 'record status', 'ACTIVE').option('-q, --query <query>').option('-l, --limit <number>', 'maximum rows', '50').action(options => withRuntime(runtime => {
  const rows = runtime.repository.list({ ...(options.kind ? { kind: options.kind.toUpperCase() as MemoryKind } : {}), ...(options.status ? { status: options.status.toUpperCase() as RecordStatus } : {}), ...(options.query ? { search: options.query } : {}), limit: Number(options.limit) });
  if (!rows.length) return console.log(pc.dim('No matching memory.'));
  rows.forEach(printRecord);
}));

for (const [command, kind] of [['decisions', 'DECISION'], ['constraints', 'CONSTRAINT'], ['failures', 'FAILURE'], ['tasks', 'TASK']] as const) {
  program.command(command).description(`List active ${command}`).action(() => withRuntime(runtime => runtime.repository.list({ kind, status: 'ACTIVE' }).forEach(printRecord)));
}

program.command('why').description('Explain remembered context for a topic').argument('<topic>').action(topic => withRuntime(runtime => {
  const rows = runtime.repository.list({ search: topic, limit: 30 });
  if (!rows.length) console.log(pc.dim(`No memory found for "${topic}".`)); else rows.forEach(printRecord);
}));

program.command('context').description('Compile the minimal project context').option('-b, --budget <tokens>').option('-q, --query <topic>').option('--json').action(options => withRuntime(runtime => {
  const result = compileContext(runtime.repository, runtime.profile, Number(options.budget ?? runtime.config.contextBudget), options.query);
  console.log(options.json ? JSON.stringify(result, null, 2) : result.markdown);
}));

program.command('checkpoint').description('Capture current Git and project state').argument('[label]').action(label => withRuntime(runtime => {
  const cp = createCheckpoint(runtime.root, runtime.repository, label); console.log(`${pc.green('✓')} ${pc.cyan(cp.id)} ${cp.summary}`);
}));

program.command('status').description('Show project memory status').action(() => withRuntime(runtime => {
  const active = runtime.repository.list({ status: 'ACTIVE', limit: 1000 });
  const counts = Object.fromEntries(['TASK', 'DECISION', 'CONSTRAINT', 'FAILURE', 'FACT', 'ASSUMPTION'].map(kind => [kind, active.filter(r => r.kind === kind).length]));
  console.log(`${pc.bold(runtime.config.projectName)}\nRoot: ${runtime.root}\nType: ${runtime.profile.projectType.join(', ') || 'Unknown'}\nActive: ${JSON.stringify(counts)}\nLast checkpoint: ${runtime.repository.lastCheckpoint()?.id ?? 'none'}`);
}));

program.command('history').description('Show recent memory events').option('-l, --limit <number>', 'maximum events', '30').action(options => withRuntime(runtime => runtime.repository.history(Number(options.limit)).forEach(e => console.log(`${pc.dim(e.createdAt)} ${pc.cyan(e.type)} ${JSON.stringify(e.payload)}`))));
program.command('doctor').description('Diagnose the local installation').action(() => {
  const root = requireProjectRoot(); const checks = runDoctor(root); checks.forEach(c => console.log(`${c.ok ? pc.green('✓') : c.required ? pc.red('✗') : pc.yellow('○')} ${c.name}: ${c.detail}`));
  if (checks.some(c => c.required && !c.ok)) process.exitCode = 1;
});
program.command('mcp').description('Run the Mnemo MCP server over stdio').action(() => serveMcp());

async function launch(agent?: AgentName) {
  const root = requireProjectRoot(); const runtime = openRuntime(root);
  try {
    const available = availableAgents();
    let selected = agent;
    if (!selected) {
      if (!process.stdin.isTTY) throw new Error('Choose an agent: ctx codex, ctx claude, or ctx gemini.');
      const answer = await p.select({ message: 'Select agent', options: available.map(value => ({ value, label: value[0]!.toUpperCase() + value.slice(1) })) });
      if (p.isCancel(answer)) return;
      selected = answer as AgentName;
    }
    const context = compileContext(runtime.repository, runtime.profile, runtime.config.contextBudget).markdown;
    console.log(`${pc.green('✓')} Context compiled. Starting ${selected}...`);
    process.exitCode = await startAgent(selected, root, context, runtime.repository);
  } finally { runtime.db.close(); }
}
for (const agent of ['codex', 'claude', 'gemini'] as const) program.command(agent).description(`Start ${agent} with project context`).action(() => launch(agent));

program.action(async () => {
  if (!findProjectRoot()) { program.outputHelp(); return; }
  await launch();
});

program.parseAsync().catch(error => {
  console.error(pc.red(error instanceof Error ? error.message : String(error)));
  process.exitCode = typeof error?.exitCode === 'number' ? error.exitCode : 1;
});
