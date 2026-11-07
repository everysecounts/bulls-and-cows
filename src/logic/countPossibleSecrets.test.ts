import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from './countPossibleSecrets';

describe('countPossibleSecrets', () => {
  it('counts possible secrets for binary system', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('counts possible secrets for octal system', () => {
    expect(countPossibleSecrets(3, 8)).toBe(336);
  });

  it('counts possible secrets for decimal system', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
  });

  it('counts possible secrets for hexadecimal system', () => {
    expect(countPossibleSecrets(4, 16)).toBe(43680);
  });

  it('supports the maximum game length', () => {
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
  });

  it('returns one for a zero-length secret', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('returns zero when length exceeds the available digits', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
  });
});
