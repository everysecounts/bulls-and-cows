import { generateSecret } from '@/logic/generateSecret';
import { addRecord, loadRecords, type RecordEntry } from '@/logic/records';
import { createInitialState, resetGame, startGame, submitGuess, type GameState } from '@/game';
import { loadSettings, saveSettings } from '@/settings';
import { createElement } from '@/utils/createElement';
import { createGame, createHeader, createSettings, createWin } from './components';

const createApp = (root: HTMLElement): void => {
  const savedSettings = loadSettings();

  let selectedLength = savedSettings.length;
  let selectedBase = savedSettings.base;

  let state: GameState = createInitialState({
    length: selectedLength,
    base: selectedBase,
  });

  let records: RecordEntry[] = loadRecords();

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const createRecordsDialog = (): HTMLDialogElement => {
    const dialog = createElement('dialog', {
      className: 'records-dialog',
    }) as HTMLDialogElement;

    const closeButton = createElement('button', {
      className: 'records-close',
      textContent: '×',
    });

    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('aria-label', 'Close leaderboard');

    closeButton.addEventListener('click', () => {
      dialog.close();
    });

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    const content = createElement('div', {
      className: 'records-content',
    });

    content.append(createElement('h2', { textContent: 'Leaderboard' }));

    if (records.length === 0) {
      content.append(
        createElement('p', {
          className: 'empty',
          textContent: 'No records yet',
        }),
      );
    } else {
      const table = createElement('table', {
        className: 'records-table',
      });

      const headerRow = createElement('tr', {}, [
        createElement('th', { textContent: '#' }),
        createElement('th', { textContent: 'Attempts' }),
        createElement('th', { textContent: 'Time' }),
        createElement('th', { textContent: 'Settings' }),
      ]);

      const thead = createElement('thead', {}, [headerRow]);
      const tbody = createElement('tbody');

      records.forEach((record, index) => {
        const row = createElement('tr', {}, [
          createElement('td', { textContent: String(index + 1) }),
          createElement('td', { textContent: String(record.attempts) }),
          createElement('td', { textContent: formatTime(record.timeMs) }),
          createElement('td', {
            textContent: `${record.length} / ${record.baseLabel}`,
          }),
        ]);

        tbody.append(row);
      });

      table.append(thead, tbody);
      content.append(table);
    }

    dialog.append(closeButton, content);

    return dialog;
  };

  const handleOpenLeaderboard = (): void => {
    const dialog = createRecordsDialog();

    root.append(dialog);
    dialog.showModal();

    dialog.addEventListener('close', () => {
      dialog.remove();
    });
  };

  const render = (): void => {
    root.replaceChildren(
      createHeader({
        onNewGame: state.status !== 'settings' ? handleNewGame : undefined,
        onLeaderboard: handleOpenLeaderboard,
      }),
    );

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

    if (
      result.success &&
      result.state.status === 'won' &&
      result.state.startedAt !== null &&
      result.state.finishedAt !== null
    ) {
      records = addRecord(
        result.state.history.length,
        result.state.finishedAt - result.state.startedAt,
        result.state.settings.length,
        result.state.settings.base,
      );
    }

    render();
  };

  const handleNewGame = (): void => {
    state = resetGame(state);
    render();
  };

  render();
};

export { createApp };
