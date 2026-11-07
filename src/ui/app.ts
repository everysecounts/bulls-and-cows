import { createElement } from '../utils/createElement';
import { generateSecret } from '../logic/generateSecret';
import { countPossibleSecrets } from '../logic/countPossibleSecrets';
import { createInitialState, startGame, type GameState } from '../logic/gameState';

const LENGTHS = [2, 3, 4, 5, 6] as const;
const BASES = [
  { label: 'bin', base: 2 },
  { label: 'oct', base: 8 },
  { label: 'dec', base: 10 },
  { label: 'hex', base: 16 },
] as const;

export const createApp = (root: HTMLElement): void => {
  let selectedLength = 4;
  let selectedBase = 10;
  let state: GameState = createInitialState({
    length: selectedLength,
    base: selectedBase,
  });

  const app = createElement('div', { className: 'app' });
  root.append(app);

  const render = (): void => {
    app.replaceChildren();

    app.append(
      createElement('header', { className: 'header' }, [
        createElement('h1', { textContent: 'Bulls and Cows' }),
        createElement('p', {
          className: 'subtitle',
          textContent: 'Guess the secret number of unique digits',
        }),
      ]),
    );

    if (state.status === 'settings') {
      app.append(renderSettings());
    } else {
      app.append(
        createElement('section', { className: 'card' }, [
          createElement('p', {
            textContent: `Playing · length ${state.settings.length} · base ${state.settings.base}`,
          }),
          createElement('p', {
            className: 'hint',
            textContent: `Secret generated (${state.secret?.length ?? 0} digits)`,
          }),
        ]),
      );
    }
  };

  const renderSettings = (): HTMLElement => {
    const section = createElement('section', { className: 'card' });
    section.append(createElement('h2', { textContent: 'Settings' }));
    section.append(createElement('label', { textContent: 'Length' }));
    const lengthGroup = createElement('div', { className: 'btn-group' });
    LENGTHS.forEach((len) => {
      const disabled = len > selectedBase;
      const btn = createElement('button', {
        className: `btn${selectedLength === len ? ' active' : ''}`,
        textContent: String(len),
        attributes: disabled ? { disabled: 'true' } : {},
      });
      btn.addEventListener('click', () => {
        if (disabled) return;
        selectedLength = len;
        render();
      });
      lengthGroup.append(btn);
    });
    section.append(lengthGroup);

    section.append(createElement('label', { textContent: 'Numeral system' }));
    const baseGroup = createElement('div', { className: 'btn-group' });
    BASES.forEach(({ label, base }) => {
      const btn = createElement('button', {
        className: `btn${selectedBase === base ? ' active' : ''}`,
        textContent: label,
      });
      btn.addEventListener('click', () => {
        selectedBase = base;
        if (base === 2) selectedLength = 2;
        else if (selectedLength > base) selectedLength = base;
        render();
      });
      baseGroup.append(btn);
    });
    section.append(baseGroup);

    const possible = countPossibleSecrets(selectedLength, selectedBase);
    section.append(
      createElement('p', {
        className: 'hint',
        textContent: `Possible secrets: ${possible.toLocaleString()}`,
      }),
    );

    const startBtn = createElement('button', {
      className: 'btn btn-primary',
      textContent: 'Start game',
    });
    startBtn.addEventListener('click', () => {
      const settings = { length: selectedLength, base: selectedBase };
      state = createInitialState(settings);
      const secret = generateSecret(settings.length, settings.base);
      state = startGame(state, secret, Date.now());
      render();
    });
    section.append(startBtn);

    return section;
  };

  render();
};
