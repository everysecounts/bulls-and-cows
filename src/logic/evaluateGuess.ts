export const evaluateGuess = (secret: string, guess: string): { bulls: number; cows: number } => {
  const secretDigits = [...secret.toLowerCase()];
  const guessDigits = [...guess.toLowerCase()];

  const bulls = guessDigits.reduce(
    (count, digit, index) => count + Number(digit === secretDigits[index]),
    0,
  );

  const cows = guessDigits
    .map((digit, index) => (digit === secretDigits[index] ? null : digit))
    .filter((digit): digit is string => digit !== null && secretDigits.includes(digit)).length;

  return { bulls, cows };
};
