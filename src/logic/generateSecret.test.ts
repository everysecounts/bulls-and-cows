import { describe, expect, it, vi } from 'vitest';
import { generateSecret } from './generateSecret';

describe('generateSecret', () => {
  it('returns a secret with the requested length', () => {
    const secret = generateSecret(4, 10, () => 0);
    expect(secret).toHaveLength(4);
  });

  it('returns a secret with unique digits', () => {
    const secret = generateSecret(4, 10, () => 0);
    expect(new Set(secret).size).toBe(secret.length);
  });

  it('uses only digits available in the selected base', () => {
    const secret = generateSecret(2, 2, () => 0);
    expect([...secret].every((digit) => '01'.includes(digit))).toBe(true);
  });

  it('allows zero as the first digit', () => {
    const secret = generateSecret(2, 10, () => 0);
    expect(secret[0]).toBe('0');
  });

  it('uses the provided random function', () => {
    const random = vi.fn(() => 0);
    generateSecret(2, 10, random);
    expect(random).toHaveBeenCalled();
  });
});
