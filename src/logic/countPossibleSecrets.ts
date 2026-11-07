const cache = new Map<string, number>();

const countPossibleSecrets = (length: number, base: number): number => {
  if (length < 0 || base < 0 || length > base) {
    return 0;
  }

  if (length === 0) {
    return 1;
  }

  const cacheKey = `${length}:${base}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const result = base * countPossibleSecrets(length - 1, base - 1);
  cache.set(cacheKey, result);

  return result;
};

export { countPossibleSecrets };
