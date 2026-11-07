import { createDigitValidator } from '@/logic/createDigitValidator';
import type { GameState } from '@/game';
import { createElement } from '@/utils/createElement';

type GameProps = {
  state: GameState;
  onGuess: (guess: string) => void;
};

const createGame = ({ state, onGuess }: GameProps): HTMLElement => {
  const section = createElement('section', { className: 'card' });
  const { length, base } = state.settings;

  const baseLabels: Record<number, string> = {
    2: 'bin',
    8: 'oct',
    10: 'dec',
    16: 'hex',
  };

  section.append(
    createElement('div', { className: 'meta' }, [
      createElement('span', { textContent: `Length: ${length}` }),
      createElement('span', {
        textContent: `Base: ${baseLabels[base] ?? base}`,
      }),
      createElement('span', {
        textContent: `Attempts: ${state.history.length}`,
      }),
    ]),
  );

  const isDigit = createDigitValidator(base);

  const inputRow = createElement('div', { className: 'input-row' });

  const input = createElement('input', {
    className: 'guess-input',
    attributes: {
      type: 'text',
      maxlength: String(length),
      placeholder: `${length} unique digits`,
      autocomplete: 'off',
      spellcheck: 'false',
    },
  });

  const submitButton = createElement('button', {
    className: 'btn btn-primary btn-guess',
    textContent: 'Guess',
    attributes: { disabled: 'true' },
  });

  const updateSubmitButton = (): void => {
    const isValid = input.value.length === length && new Set(input.value).size === length;

    submitButton.disabled = !isValid || state.status !== 'playing';
  };

  input.addEventListener('input', () => {
    const filteredDigits: string[] = [];

    for (const char of input.value.toLowerCase()) {
      if (isDigit(char) && !filteredDigits.includes(char)) {
        filteredDigits.push(char);
      }

      if (filteredDigits.length === length) {
        break;
      }
    }

    const filteredValue = filteredDigits.join('');

    if (input.value !== filteredValue) {
      input.value = filteredValue;
    }

    updateSubmitButton();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !submitButton.disabled) {
      onGuess(input.value);
    }
  });

  submitButton.addEventListener('click', () => {
    onGuess(input.value);
  });

  inputRow.append(input, submitButton);
  section.append(inputRow);

  section.append(createElement('h3', { textContent: 'History' }));

  const historyList = createElement('ul', { className: 'history' });

  if (state.history.length === 0) {
    historyList.append(
      createElement('li', {
        className: 'empty',
        textContent: 'No guesses yet',
      }),
    );
  } else {
    state.history.forEach((entry) => {
      const guessElement = createElement('span', { className: 'guess' });

      [...entry.guess].forEach((digit, index) => {
        const normalizedDigit = digit.toLowerCase();
        const secret = state.secret?.toLowerCase() ?? '';
        const isBull = normalizedDigit === secret[index];
        const isCow = !isBull && secret.includes(normalizedDigit);

        const className = isBull
          ? 'guess-digit guess-digit-bull'
          : isCow
            ? 'guess-digit guess-digit-cow'
            : 'guess-digit';

        guessElement.append(
          createElement('span', {
            className,
            textContent: digit,
          }),
        );
      });

      historyList.append(
        createElement('li', { className: 'history-item' }, [
          guessElement,
          createElement('span', {
            className: 'result',
            textContent: `Bulls: ${entry.bulls} · Cows: ${entry.cows}`,
          }),
        ]),
      );
    });
  }

  section.append(historyList);

  requestAnimationFrame(() => {
    historyList.scrollTop = historyList.scrollHeight;
  });

  return section;
};

export { createGame };
