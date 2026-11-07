const generateSecret = (
  length: number,
  base: number,
  random: () => number = Math.random,
): string => {
  const digits = Array.from({ length: base }, (_, index) => index.toString(16));

  for (let index = 0; index < length; index += 1) {
    const randomIndex = index + Math.floor(random() * (base - index));

    [digits[index], digits[randomIndex]] = [digits[randomIndex], digits[index]];
  }

  return digits.slice(0, length).join('');
};

export { generateSecret };
