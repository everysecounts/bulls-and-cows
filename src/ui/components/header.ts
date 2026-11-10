import { createElement } from '@/utils/createElement';

type HeaderProps = {
  onNewGame?: () => void;
  onLeaderboard: () => void;
};

const createHeader = ({ onNewGame, onLeaderboard }: HeaderProps): HTMLElement => {
  const header = createElement('header', { className: 'header' });

  header.append(
    createElement('h1', { textContent: 'Bulls and Cows' }),
    createElement('p', {
      className: 'subtitle',
      textContent: 'Guess the secret number of unique digits',
    }),
  );

  const actions = createElement('div', { className: 'header-actions' });

  if (onNewGame) {
    const newGameButton = createElement('button', {
      className: 'btn btn-header',
      textContent: 'New game',
    });

    newGameButton.setAttribute('type', 'button');
    newGameButton.addEventListener('click', onNewGame);

    actions.append(newGameButton);
  }

  const leaderboardButton = createElement('button', {
    className: 'btn btn-header',
    textContent: 'Leaderboard',
  });

  leaderboardButton.setAttribute('type', 'button');
  leaderboardButton.addEventListener('click', onLeaderboard);

  actions.append(leaderboardButton);
  header.append(actions);

  return header;
};

export { createHeader };
