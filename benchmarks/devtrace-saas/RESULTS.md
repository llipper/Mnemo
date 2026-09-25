# Mnemo benchmark — first paired run

Date: 2026-09-25

## Scenario

Two copies of the same DevTrace seed implemented `packages/event-schema` with Codex `gpt-6-sol` at medium reasoning effort.

- Baseline: the agent reconstructed context from the full handoff history.
- Mnemo: the agent received a 603-token compiled context and was explicitly told not to read the full history.

Both runs encountered the same Windows sandbox `EPERM` problem while accessing the prepared pnpm dependencies. Both implementations were therefore validated afterward from the host with the same commands.

## Actual Codex usage

| Metric | Baseline | Mnemo | Change |
| --- | ---: | ---: | ---: |
| Input tokens | 2,630,147 | 1,486,440 | -1,143,707 (-43.48%) |
| Cached input tokens | 2,569,472 | 1,437,952 | -44.04% |
| Uncached input tokens | 60,675 | 48,488 | -12,187 (-20.09%) |
| Output tokens | 22,481 | 19,700 | -2,781 (-12.37%) |
| Reasoning output tokens | 7,963 | 8,430 | +467 (+5.86%) |
| Input + output | 2,652,628 | 1,506,140 | -43.22% |
| Uncached input + output | 83,156 | 68,188 | -14,968 (-18.00%) |

Cached tokens are included in the Codex-reported input total. The uncached comparison is therefore the more conservative indicator of newly processed context.

## Quality checks

| Check | Baseline | Mnemo |
| --- | --- | --- |
| TypeScript typecheck | Pass | Pass |
| Vitest | 9/9 pass | 10/10 pass |
| Strict v1 schema | Implemented | Implemented |
| Structured validation issues | Implemented | Implemented |
| Recursive immutable redaction | Implemented | Implemented |
| UTF-8 payload limits | Implemented | Implemented |
| Deterministic SHA-256 fingerprint | Implemented | Implemented |
| Package documentation | Implemented | Implemented |

The baseline package contains 622 source/config/test/documentation lines. The Mnemo package contains 576. Line count is descriptive, not a quality score.

## Interpretation

This first paired run supports the hypothesis that Mnemo reduces context consumption without reducing the tested deliverable quality. The conservative fresh-token reduction was 18.00%, while the provider-reported total reduction was 43.22%.

This is not yet a statistically reliable claim. The run was affected by a shared dependency-access issue and represents one pair. The protocol requires at least five paired runs with alternating order, deterministic acceptance tests and median/range reporting before publishing a performance claim.
