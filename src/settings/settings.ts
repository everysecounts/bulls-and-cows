const LENGTHS = [2, 3, 4, 5, 6] as const;

const BASES = [
  { label: 'bin', base: 2 },
  { label: 'oct', base: 8 },
  { label: 'dec', base: 10 },
  { label: 'hex', base: 16 },
] as const;

const SETTINGS_STORAGE_KEY = 'bulls-and-cows-settings';

const DEFAULT_SETTINGS = {
  length: 2,
  base: 2,
};

type GameSettings = {
  length: number;
  base: number;
};

export { BASES, DEFAULT_SETTINGS, LENGTHS, SETTINGS_STORAGE_KEY };
export type { GameSettings };
