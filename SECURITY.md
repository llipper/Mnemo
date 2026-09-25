# Security policy

## Reporting a vulnerability

Do not disclose exploitable vulnerabilities or real credentials in a public issue. Contact the maintainers privately through the security contact configured in the repository once it is published.

Until a private contact exists, prepare a minimal report locally containing:

- affected version;
- root cause;
- controlled reproduction;
- impact;
- suggested remediation.

Never include third-party secrets, tokens, cookies, private keys or personal data.

## Security boundaries

Mnemo stores project memory locally in `.context/context.db`. Its sanitizer reduces accidental credential persistence but is not a secret manager and cannot guarantee detection of every credential format.
