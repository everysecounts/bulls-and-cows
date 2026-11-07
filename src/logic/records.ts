export type RecordEntry = {
  id: string;
  attempts: number;
  timeMs: number;
  length: number;
  base: number;
  baseLabel: string;
  date: string;
};

const STORAGE_KEY = 'bulls-and-cows-records';
const MAX_RECORDS = 10;

const BASE_LABEL: Record<number, string> = {
  2: 'bin',
  8: 'oct',
  10: 'dec',
  16: 'hex',
};

const loadRecords = (): RecordEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as RecordEntry[];
  } catch {
    return [];
  }
};

const saveRecords = (records: RecordEntry[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
};

const addRecord = (
  attempts: number,
  timeMs: number,
  length: number,
  base: number,
): RecordEntry[] => {
  const entry: RecordEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    attempts,
    timeMs,
    length,
    base,
    baseLabel: BASE_LABEL[base] ?? String(base),
    date: new Date().toISOString(),
  };

  const updated = [...loadRecords(), entry].sort((a, b) => {
    if (a.attempts !== b.attempts) {
      return a.attempts - b.attempts;
    }

    return a.timeMs - b.timeMs;
  });

  const top = updated.slice(0, MAX_RECORDS);

  saveRecords(top);

  return top;
};

export { addRecord, loadRecords, saveRecords };
