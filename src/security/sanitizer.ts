const rules: Array<[string, RegExp]> = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/gi],
  ['jwt', /\beyJ[a-zA-Z0-9_-]{8,}\.eyJ[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{8,}\b/g],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g],
  ['openai-key', /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ['aws-access-key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['generic-secret', /\b(api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|password)\s*[:=]\s*["']?([^\s"']{8,})["']?/gi],
  ['authorization', /\bAuthorization\s*:\s*(?:Bearer|Basic)\s+[^\s]+/gi],
];

export interface SanitizedText { value: string; redactions: string[] }

export function sanitize(input: string): SanitizedText {
  const redactions: string[] = [];
  let value = input;
  for (const [name, pattern] of rules) {
    value = value.replace(pattern, () => {
      redactions.push(name);
      return `[REDACTED:${name}]`;
    });
  }
  return { value, redactions: [...new Set(redactions)] };
}

export function assertSafe(input: string): void {
  const result = sanitize(input);
  if (result.redactions.length) throw new Error(`Secret-like content detected: ${result.redactions.join(', ')}`);
}
