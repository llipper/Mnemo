# DevTrace

DevTrace is a language-agnostic SaaS for capturing, correlating and debugging HTTP/API calls across development, staging and production environments.

This directory is the immutable seed used by the Mnemo token-consumption benchmark. Agents implement the same task in separate copies derived from this seed.

## Benchmark task

Implement the first production package: `packages/event-schema`.

The package must provide:

- a versioned, strict TypeScript schema for ingested API-call events;
- safe validation with actionable errors;
- recursive secret redaction without mutating the input;
- request and response body size limits;
- deterministic event fingerprinting;
- unit tests for validation, redaction and fingerprint stability;
- package documentation and public exports.

Do not implement the web application, database or ingestion server in this task.
