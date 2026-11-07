import { createDigitValidator } from './createDigitValidator';

export const isValidGuess = (guess: string, length: number, base: number): boolean => {
  const isValidDigit = createDigitValidator(base);
  const digits = [...guess.toLowerCase()];

  const isValid =
    digits.length === length &&
    digits.every(isValidDigit) &&
    new Set(digits).size === digits.length;

  return !isValid;
};
