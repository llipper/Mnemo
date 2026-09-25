# Mnemo implementation tracker

## Architecture

- [x] Node.js 22+ and strict TypeScript CLI
- [x] Local SQLite persistence with migrations
- [x] Domain stores for facts, decisions, constraints, tasks and failures
- [x] Secret scanning and sanitization before persistence
- [x] Local project detection and repository map
- [x] Git-aware checkpoints and change capture
- [x] Token-budgeted context compiler
- [x] Codex, Claude Code and Gemini CLI adapters
- [x] Local MCP stdio server
- [x] Doctor, status, history and retrieval commands
- [x] Unit and integration tests
- [ ] Package publication (requires repository URL and npm ownership)
- [ ] Homebrew formula (after the first published release)

## Release gates

- [x] Dependencies installed
- [x] Typecheck passing
- [x] Test suite passing
- [x] Production bundle built
- [x] Global link smoke-tested on Windows
- [ ] Global install smoke-tested on macOS and Linux
- [ ] First cross-agent handoff validated in a real repository

The unchecked release gates require execution and/or external publishing; they are not inferred from source inspection.
