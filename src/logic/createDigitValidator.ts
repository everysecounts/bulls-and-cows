export const createDigitValidator = (base: number) => {
  const validDigits = '0123456789abcdef'.slice(0, base);

  return (char: string): boolean => {
    return char.length === 1 && validDigits.includes(char.toLowerCase());
  };
};
