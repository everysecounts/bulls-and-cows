import { describe, expect, it } from 'vitest';
import { isValidGuess } from './isValidGuess';

describe('isValidGuess', () => {
  it('returns true for a valid binary guess', () => {
    expect(isValidGuess('01', 2, 2)).toBe(true);
  });

  it('returns true for a valid octal guess', () => {
    expect(isValidGuess('12345670', 8, 8)).toBe(true);
  });

  it('returns true for a valid decimal guess', () => {
    expect(isValidGuess('1234567890', 10, 10)).toBe(true);
  });

  it('returns true for a valid hexadecimal guess', () => {
    expect(isValidGuess('a1b2c3d4e5f0', 12, 16)).toBe(true);
  });

  it('returns false for a guess with an incorrect length', () => {
    expect(isValidGuess('123', 4, 10)).toBe(false);
  });

  it('returns false for a guess containing a digit outside the base', () => {
    expect(isValidGuess('129', 3, 8)).toBe(false);
  });

  it('returns false for a guess containing duplicate digits', () => {
    expect(isValidGuess('112', 3, 10)).toBe(false);
  });

  it('returns false for hexadecimal guesses with duplicate digits in different cases', () => {
    expect(isValidGuess('aA', 2, 16)).toBe(false);
  });
});
