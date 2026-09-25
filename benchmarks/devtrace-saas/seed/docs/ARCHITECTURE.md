# Architecture

## Stack

- TypeScript monorepo managed by pnpm workspaces and Turborepo.
- Next.js web console.
- Fastify ingestion/control API.
- PostgreSQL for organizations, projects, configuration and billing metadata.
- ClickHouse for high-volume immutable API events.
- Redis-backed jobs for asynchronous processing.
- S3-compatible object storage for optional encrypted large payloads.
- OpenTelemetry-compatible ingestion.

## Trust boundaries

The public ingestion surface is separate from the authenticated control plane. Ingestion keys are project-scoped, hashed at rest, rotatable and never accepted by the web console as user credentials.

Every query is scoped by organization and project on the server. IDs supplied by clients never establish authorization.

## Event pipeline

SDK or collector → ingestion authentication → size enforcement → schema validation → secret redaction → durable queue → event storage → searchable projection.

The pipeline must retain safe partial metadata when an optional body cannot be accepted. Secret redaction occurs before logs, queues or durable storage.
