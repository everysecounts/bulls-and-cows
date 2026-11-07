import { describe, expect, it } from 'vitest';
import { evaluateGuess } from './evaluateGuess';

describe('evaluateGuess', () => {
  it('counts bulls when digits match in the same positions', () => {
    expect(evaluateGuess('1234', '1325')).toEqual({
      bulls: 1,
      cows: 2,
    });
  });

  it('counts cows when digits match in different positions', () => {
    expect(evaluateGuess('1234', '4321')).toEqual({
      bulls: 0,
      cows: 4,
    });
  });

  it('returns zero bulls and cows when there are no matching digits', () => {
    expect(evaluateGuess('1234', '5678')).toEqual({
      bulls: 0,
      cows: 0,
    });
  });

  it('counts only bulls when matching digits are in the correct positions', () => {
    expect(evaluateGuess('1234', '1567')).toEqual({
      bulls: 1,
      cows: 0,
    });
  });

  it('returns the secret length as bulls for an exact guess', () => {
    expect(evaluateGuess('1234', '1234')).toEqual({
      bulls: 4,
      cows: 0,
    });
  });

  it('compares hexadecimal digits without case sensitivity', () => {
    expect(evaluateGuess('aB3f', 'Ab3F')).toEqual({
      bulls: 4,
      cows: 0,
    });
  });
});
