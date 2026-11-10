import { describe, expect, it } from 'vitest';
import { createDigitValidator } from './createDigitValidator';

describe('createDigitValidator', () => {
  describe('binary system', () => {
    const isValidDigit = createDigitValidator(2);

    it('should accept valid binary digits', () => {
      expect(isValidDigit('0')).toBe(true);
      expect(isValidDigit('1')).toBe(true);
    });

    it('should reject invalid binary digits', () => {
      expect(isValidDigit('0')).toBe(true);
      expect(isValidDigit('2')).toBe(false);
    });
  });

  describe('octal system', () => {
    const isValidDigit = createDigitValidator(8);

    it('should accept valid octal digits', () => {
      expect(isValidDigit('0')).toBe(true);
      expect(isValidDigit('7')).toBe(true);
    });

    it('should reject invalid octal digits', () => {
      expect(isValidDigit('7')).toBe(true);
      expect(isValidDigit('8')).toBe(false);
    });
  });

  describe('decimal system', () => {
    const isValidDigit = createDigitValidator(10);

    it('should accept valid decimal digits', () => {
      expect(isValidDigit('0')).toBe(true);
      expect(isValidDigit('9')).toBe(true);
    });

    it('should reject invalid decimal digits', () => {
      expect(isValidDigit('9')).toBe(true);
      expect(isValidDigit('a')).toBe(false);
    });
  });

  describe('hexadecimal system', () => {
    const isValidDigit = createDigitValidator(16);

    it('should accept valid hexadecimal digits', () => {
      expect(isValidDigit('a')).toBe(true);
      expect(isValidDigit('f')).toBe(true);
      expect(isValidDigit('A')).toBe(true);
      expect(isValidDigit('F')).toBe(true);
    });

    it('should reject invalid hexadecimal digits', () => {
      expect(isValidDigit('a')).toBe(true);
      expect(isValidDigit('g')).toBe(false);
    });
  });
});
