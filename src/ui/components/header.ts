import { createElement } from '@/utils/createElement';

const createHeader = (): HTMLElement => {
  return createElement('header', { className: 'header' }, [
    createElement('h1', { textContent: 'Bulls and Cows' }),
    createElement('p', {
      className: 'subtitle',
      textContent: 'Guess the secret number of unique digits',
    }),
  ]);
};

export { createHeader };
