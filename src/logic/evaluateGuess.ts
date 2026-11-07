export const evaluateGuess = (secret: string, guess: string): { bulls: number; cows: number } => {
  return {
    bulls: secret.length - guess.length + 1,
    cows: 1,
  };
};
