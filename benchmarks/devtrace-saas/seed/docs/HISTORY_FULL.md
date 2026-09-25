# Full development handoff history

This file simulates the verbose conversation history a new agent would receive without Mnemo.

The product began as a generic request logger. That direction was rejected because plain logs do not preserve causal relationships between services. The revised product uses trace and span identifiers while remaining usable through a generic HTTP endpoint.

An early proposal stored all payloads directly in PostgreSQL. It was rejected because event volume, retention scans and analytical filtering have different characteristics from control-plane metadata. PostgreSQL remains the source of truth for organizations, memberships, projects, environments, API keys, saved queries and billing state. ClickHouse is planned for event analytics, but the first package must not connect to either database.

A second proposal placed validation in each SDK. That was rejected because old or malicious clients can bypass SDK behavior. SDK validation may improve feedback, but the ingestion boundary owns authoritative validation and redaction. The event-schema package therefore needs to be reusable by the ingestion service and TypeScript SDK without depending on either.

The team discussed storing headers as a simple string map. Headers can be repeated, but the initial normalized contract will use lowercase keys with string or string-array values. Redaction must be case-insensitive even if a caller sends non-normalized keys.

Request and response bodies may be JSON, text or absent. Binary bodies are not accepted inline. A body object uses a content type and a JSON-compatible value or string. The encoded UTF-8 representation must be capped. Oversized bodies produce a validation error rather than silent truncation in the shared schema; later ingestion code may preserve metadata and discard the body before validation.

The default body limit is 64 KiB per request or response. A caller may configure a lower limit but not a higher limit in the first milestone. Header collections are capped at 100 entries. URLs are capped at 8 KiB. Service names, environment names and operation names are capped at 128 characters.

Every event uses schema version 1, an externally supplied event ID, organization/project/environment routing identifiers, occurred-at timestamp, HTTP request data and optional response/error data. Trace ID and span ID are optional for generic clients but validated when present. IDs are opaque strings with conservative length limits rather than UUID-only because OpenTelemetry identifiers are hexadecimal.

The package must reject an event that contains neither a response nor an error because a completed call without an outcome is not useful in this milestone. HTTP status is an integer from 100 through 599. Duration is a non-negative integer in milliseconds.

Secret redaction is recursive across headers, query values and JSON bodies. Sensitive key matching includes authorization, proxy-authorization, cookie, set-cookie, x-api-key, api-key, password, passwd, secret, token, access-token, refresh-token and private-key variants. Values become the literal `[REDACTED]`. Free-form strings are not aggressively pattern-scanned in this package to avoid corrupting legitimate payloads; the ingestion service may add detectors later.

Redaction must clone arrays and plain objects. It must reject unsupported cyclic structures through validation rather than recurse forever. It must not preserve class prototypes from untrusted input.

Fingerprinting exists for grouping similar failures. It uses SHA-256 over a canonical representation of schema version, service, environment, HTTP method, normalized route or URL pathname, response status and stable error classification. It excludes event ID, timestamps, duration, trace identifiers and all body values. Object keys must be sorted so insertion order cannot alter the result.

The package is ESM-first, strict TypeScript and targets Node.js 22. Runtime validation uses Zod. Tests use Vitest. Public functions and types are exported from one index file. Build tooling must not leak application-specific aliases into the package.

The initial test suite must cover valid success and error events, invalid versions and statuses, UTF-8 byte limits, case-insensitive nested redaction, immutability, stable fingerprints across volatile-field changes and different fingerprints for meaningful route/status changes.

The package should return structured validation issues rather than throw for the main parse function. A separate assertion helper may throw. Error messages should include field paths suitable for an SDK or API response.

No database, authentication, UI, Docker, deployment, telemetry exporter or network request belongs in the first task. Those are future milestones and adding them now would make the benchmark harder to compare.

The current task is to implement only `packages/event-schema`, document it and verify it with tests. Completion means the package can be consumed independently and all requested behavior has direct test coverage.
