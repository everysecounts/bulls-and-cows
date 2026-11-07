import { BASES, DEFAULT_SETTINGS, LENGTHS, SETTINGS_STORAGE_KEY } from './settings';
import type { GameSettings } from './settings';

const loadSettings = (): GameSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed: unknown = JSON.parse(stored);

    if (typeof parsed !== 'object' || parsed === null) {
      return DEFAULT_SETTINGS;
    }

    const settings = parsed as Record<string, unknown>;
    const { length, base } = settings;

    if (typeof length !== 'number' || typeof base !== 'number') {
      return DEFAULT_SETTINGS;
    }

    if (
      !LENGTHS.includes(length as (typeof LENGTHS)[number]) ||
      !BASES.some((item) => item.base === base) ||
      length > base
    ) {
      return DEFAULT_SETTINGS;
    }

    return { length, base };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (length: number, base: number): void => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ length, base }));
};

export { loadSettings, saveSettings };
