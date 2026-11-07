import { evaluateGuess } from './evaluateGuess';
import { isValidGuess } from './isValidGuess';

export type GameSettings = {
  length: number;
  base: number;
};

export type GuessEntry = {
  guess: string;
  bulls: number;
  cows: number;
};

export type GameStatus = 'settings' | 'playing' | 'won';

export type GameState = {
  settings: GameSettings;
  secret: string | null;
  history: GuessEntry[];
  status: GameStatus;
  startedAt: number | null;
  finishedAt: number | null;
};

export type SubmitGuessResult =
  | { success: true; state: GameState }
  | {
      success: false;
      state: GameState;
      reason: 'not-playing' | 'invalid-guess' | 'duplicate-guess';
    };

export const createInitialState = (settings: GameSettings): GameState => ({
  settings,
  secret: null,
  history: [],
  status: 'settings',
  startedAt: null,
  finishedAt: null,
});

export const startGame = (state: GameState, secret: string, startedAt: number): GameState => {
  if (
    state.status !== 'settings' ||
    !isValidGuess(secret, state.settings.length, state.settings.base)
  ) {
    return state;
  }

  return {
    ...state,
    secret: secret.toLowerCase(),
    history: [],
    status: 'playing',
    startedAt,
    finishedAt: null,
  };
};

export const submitGuess = (state: GameState, guess: string, now: number): SubmitGuessResult => {
  if (state.status !== 'playing' || state.secret === null) {
    return { success: false, state, reason: 'not-playing' };
  }

  const normalizedGuess = guess.toLowerCase();

  if (!isValidGuess(normalizedGuess, state.settings.length, state.settings.base)) {
    return { success: false, state, reason: 'invalid-guess' };
  }

  if (state.history.some((entry) => entry.guess === normalizedGuess)) {
    return { success: false, state, reason: 'duplicate-guess' };
  }

  const result = evaluateGuess(state.secret, normalizedGuess);
  const entry: GuessEntry = {
    guess: normalizedGuess,
    bulls: result.bulls,
    cows: result.cows,
  };

  const history = [...state.history, entry];
  const won = result.bulls === state.settings.length;

  return {
    success: true,
    state: {
      ...state,
      history,
      status: won ? 'won' : 'playing',
      finishedAt: won ? now : null,
    },
  };
};

export const resetGame = (state: GameState): GameState => ({
  ...state,
  secret: null,
  history: [],
  status: 'settings',
  startedAt: null,
  finishedAt: null,
});
