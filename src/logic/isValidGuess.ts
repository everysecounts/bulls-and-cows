import { createDigitValidator } from './createDigitValidator';

const isValidGuess = (guess: string, length: number, base: number): boolean => {
  const isValidDigit = createDigitValidator(base);
  const digits = [...guess.toLowerCase()];

  return (
    digits.length === length && digits.every(isValidDigit) && new Set(digits).size === digits.length
  );
};

export { isValidGuess };
