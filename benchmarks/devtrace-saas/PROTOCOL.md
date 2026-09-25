# Mnemo benchmark protocol

## Question

Does a structured Mnemo handoff reduce real agent token consumption while preserving implementation quality compared with a verbose raw-history handoff?

## Controlled variables

- Same seed repository bytes.
- Same implementation task.
- Same Codex executable, model, reasoning effort and sandbox policy.
- Fresh ephemeral session for every run.
- No network-dependent application behavior.
- Runs executed sequentially to avoid resource contention.

## Treatments

### Baseline

The prompt includes `docs/HISTORY_FULL.md` verbatim plus the implementation instruction.

### Mnemo

The raw history is converted into active decisions, constraints, failures and one task. The prompt includes only `ctx context` output plus the same implementation instruction.

## Measurements

- Actual input, cached-input and output tokens reported by Codex JSON events.
- Wall-clock duration and exit status.
- Changed file count and lines added/removed.
- Typecheck and test results.
- Requirement coverage from an identical deterministic checklist.

## Interpretation

One pair is a smoke test, not a statistically reliable benchmark. A credible result requires at least five paired repetitions with run order alternated. Report median and range, not only the best run.
