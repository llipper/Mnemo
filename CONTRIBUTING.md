# Contributing to Mnemo

Mnemo welcomes focused, test-backed contributions.

1. Use Node.js 22 or newer and pnpm.
2. Install dependencies with `pnpm install`.
3. Keep core behavior offline and provider-independent.
4. Never add telemetry, network calls or credential persistence by default.
5. Add tests for behavioral changes.
6. Run `pnpm typecheck`, `pnpm lint` and `pnpm test` before opening a pull request.

Use Conventional Commit style where practical. Security issues should follow `SECURITY.md` rather than a public issue.
