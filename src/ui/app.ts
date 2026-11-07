import { generateSecret } from '@/logic/generateSecret';
import { createInitialState, resetGame, startGame, submitGuess, type GameState } from '@/game';
import { loadSettings, saveSettings } from '@/settings';
import { createGame, createHeader, createSettings, createWin } from './components';

const createApp = (root: HTMLElement): void => {
  const savedSettings = loadSettings();

  let selectedLength = savedSettings.length;
  let selectedBase = savedSettings.base;

  let state: GameState = createInitialState({
    length: selectedLength,
    base: selectedBase,
  });

  const render = (): void => {
    root.replaceChildren(createHeader(state.status !== 'settings' ? handleNewGame : undefined));

    if (state.status === 'settings') {
      root.append(
        createSettings({
          length: selectedLength,
          base: selectedBase,
          onLengthChange: handleLengthChange,
          onBaseChange: handleBaseChange,
          onStart: handleStart,
        }),
      );

      return;
    }

    root.append(
      createGame({
        state,
        onGuess: handleGuess,
      }),
    );

    if (state.status === 'won') {
      const winDialog = createWin({
        state,
        onNewGame: handleNewGame,
      });

      root.append(winDialog);
      winDialog.showModal();
    }
  };

  const handleLengthChange = (length: number): void => {
    selectedLength = length;
    saveSettings(selectedLength, selectedBase);
    render();
  };

  const handleBaseChange = (base: number): void => {
    selectedBase = base;

    if (base === 2) {
      selectedLength = 2;
    } else if (selectedLength > base) {
      selectedLength = base;
    }

    saveSettings(selectedLength, selectedBase);
    render();
  };

  const handleStart = (): void => {
    const settings = {
      length: selectedLength,
      base: selectedBase,
    };

    state = createInitialState(settings);

    const secret = generateSecret(settings.length, settings.base);

    state = startGame(state, secret, Date.now());

    render();
  };

  const handleGuess = (guess: string): void => {
    const result = submitGuess(state, guess, Date.now());
    state = result.state;
    render();
  };

  const handleNewGame = (): void => {
    state = resetGame(state);
    render();
  };

  render();
};

export { createApp };
