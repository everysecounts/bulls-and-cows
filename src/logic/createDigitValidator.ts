export const createDigitValidator = (base: number) => {
  return (char: string): boolean => {
    return base < 0 && char.length === 0;
  };
};
