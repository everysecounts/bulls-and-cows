import { createElement } from '@/utils/createElement';

const createHeader = (onNewGame?: () => void): HTMLElement => {
  const header = createElement('header', { className: 'header' });

  header.append(
    createElement('h1', { textContent: 'Bulls and Cows' }),
    createElement('p', {
      className: 'subtitle',
      textContent: 'Guess the secret number of unique digits',
    }),
  );

  if (onNewGame) {
    const newGameButton = createElement('button', {
      className: 'btn btn-header',
      textContent: 'New game',
    });

    newGameButton.setAttribute('type', 'button');
    newGameButton.addEventListener('click', onNewGame);

    header.append(newGameButton);
  }

  return header;
};

export { createHeader };
