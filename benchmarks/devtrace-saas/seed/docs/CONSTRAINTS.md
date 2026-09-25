# Constraints

- Never persist authorization headers, cookies, API keys, passwords or private keys.
- Never use email as the authorization identity.
- All tenant and project authorization is enforced server-side.
- Ingestion must be idempotent and tolerate retries.
- Event schemas are versioned; unknown versions fail closed.
- Input objects must never be mutated by sanitization.
- Payload limits are measured in UTF-8 bytes, not JavaScript character count.
- Fingerprints must exclude volatile timestamps and generated IDs.
- The first milestone must work without external services.
- No fake production data or placeholder security claims.
