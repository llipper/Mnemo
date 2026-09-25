# Mnemo

Mnemo is an open-source, local-first context runtime for coding agents. It keeps project facts, decisions, constraints, tasks, failed approaches and Git-aware checkpoints outside any individual model, then compiles only the relevant context for the next session.

The model can change. The project memory remains.

## Why Mnemo

Coding sessions are temporary, but project decisions are not. Mnemo provides a small continuity layer shared by Codex, Claude Code, Gemini CLI and any MCP-compatible client:

```text
developer → Mnemo → relevant context → coding agent → checkpoint → Mnemo
```

Mnemo is not an IDE, hosted service or coding agent. The core works offline and stores data inside the project.

## Requirements

- Node.js 22 or newer
- Git is recommended, but not required
- At least one supported agent CLI for `ctx <agent>`

## Install

During development:

```bash
pnpm install
pnpm build
npm link
```

After publication:

```bash
npm install -g mnemo-context-runtime
```

## Quick start

```bash
cd my-project
ctx init
ctx task "Implement authorization" "Add server-side role checks"
ctx decide "Identity key" "Use immutable provider subject, never email"
ctx constrain "Authorization boundary" "Every object access is checked server-side"
ctx checkpoint "Authorization foundation"
ctx codex
```

Running `ctx` without an agent opens a selector containing the installed agent CLIs.

## Commands

| Command | Purpose |
| --- | --- |
| `ctx init` | Create `.context/` and the local SQLite database |
| `ctx` | Select an installed agent and inject compiled context |
| `ctx codex` / `claude` / `gemini` | Start one agent with the current context |
| `ctx remember` | Record a durable fact |
| `ctx decide` | Record an active decision |
| `ctx constrain` | Record a critical constraint |
| `ctx task` | Record the current or next task |
| `ctx fail` | Record a failed approach and resolution |
| `ctx checkpoint` | Snapshot Git state and project continuity |
| `ctx context` | Print the token-budgeted context package |
| `ctx why <topic>` | Retrieve memory related to a decision or topic |
| `ctx status` | Show active memory and checkpoint state |
| `ctx doctor` | Diagnose runtime and agent availability |
| `ctx mcp` | Serve project memory using MCP over stdio |

Use `ctx <command> --help` for command-specific options.

## Storage

Mnemo creates:

```text
.context/
├── config.json
├── context.db
├── state.json
└── logs/
```

`.context/` should not be committed. Project configuration stays local, and SQLite uses WAL mode, foreign keys and prepared statements.

## Security model

All text is sanitized before persistence. Built-in rules redact common API keys, bearer credentials, JWTs, private keys and password-like assignments. `.contextignore` documents files that must not enter repository analysis.

Sanitization is defense in depth, not a reason to paste credentials into Mnemo. Never deliberately record secrets.

## MCP setup

Any MCP client that supports local stdio servers can launch:

```json
{
  "mcpServers": {
    "mnemo": {
      "command": "ctx",
      "args": ["mcp"]
    }
  }
}
```

Available tools include `project_state`, `project_context`, `memory_search`, `memory_get`, `report_memory` and `memory_checkpoint`.

## Design principles

- Git owns code history; Mnemo owns continuity and rationale.
- Active decisions supersede old decisions instead of silently rewriting history.
- Context cost grows with changes, not the full conversation history.
- Local rules and deterministic inspection come before optional model inference.
- An agent receives a minimal package first and retrieves more context on demand.

## Development

```bash
pnpm typecheck
pnpm test
pnpm build
```

See [PROJETO.md](./PROJETO.md) for the product definition and [IMPLEMENTATION.md](./IMPLEMENTATION.md) for release status.

## Benchmark

The first controlled handoff experiment is documented in
[`benchmarks/devtrace-saas/RESULTS.md`](./benchmarks/devtrace-saas/RESULTS.md).
It observed an 18% reduction in uncached-input-plus-output tokens with equivalent
typecheck/test outcomes. This is an initial paired run, not yet a statistically
reliable performance claim; the protocol requires at least five repetitions.

## License

Apache License 2.0.
