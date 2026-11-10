import type { GameState } from '@/game';
import { createElement } from '@/utils/createElement';

type WinProps = {
  state: GameState;
  onNewGame: () => void;
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const createWin = ({ state, onNewGame }: WinProps): HTMLDialogElement => {
  const dialog = createElement('dialog', {
    className: 'win-dialog',
  }) as HTMLDialogElement;

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    dialog.close();
  });

  const closeButton = createElement('button', {
    className: 'win-close',
    textContent: '×',
  });

  closeButton.setAttribute('type', 'button');
  closeButton.setAttribute('aria-label', 'Close dialog');

  closeButton.addEventListener('click', () => {
    dialog.close();
  });

  dialog.append(closeButton);

  const timeMs =
    state.startedAt !== null && state.finishedAt !== null ? state.finishedAt - state.startedAt : 0;

  const content = createElement('div', { className: 'win-content' });

  content.append(
    createElement('h2', { textContent: 'You have arrived!' }),
    createElement('p', {
      className: 'win-secret',
      textContent: `Secret: ${state.secret}`,
    }),
    createElement('p', {
      className: 'win-stats',
      textContent: `Attempts: ${state.history.length} · Time: ${formatTime(timeMs)}`,
    }),
  );

  const newGameButton = createElement('button', {
    className: 'btn btn-primary',
    textContent: 'New game',
  });

  newGameButton.addEventListener('click', onNewGame);

  content.append(newGameButton);
  dialog.append(content);

  return dialog;
};

export { createWin };
