import { describe, expect, it } from 'vitest';
import { sanitize } from '../src/security/sanitizer.js';

describe('sanitize', () => {
  it('redacts common credentials', () => {
    const result = sanitize('Authorization: Bearer abcdefghijklmnop and api_key=super-secret-value');
    expect(result.value).not.toContain('abcdefghijklmnop');
    expect(result.value).not.toContain('super-secret-value');
    expect(result.redactions).toContain('authorization');
    expect(result.redactions).toContain('generic-secret');
  });

  it('leaves normal project context unchanged', () => {
    expect(sanitize('Use SQLite for local memory.').value).toBe('Use SQLite for local memory.');
  });
});
