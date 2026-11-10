import { countPossibleSecrets } from '@/logic/countPossibleSecrets';
import { createElement } from '@/utils/createElement';
import { BASES, LENGTHS } from '@/settings';

type SettingsProps = {
  length: number;
  base: number;
  onLengthChange: (length: number) => void;
  onBaseChange: (base: number) => void;
  onStart: () => void;
};

const createSettings = ({
  length,
  base,
  onLengthChange,
  onBaseChange,
  onStart,
}: SettingsProps): HTMLElement => {
  const section = createElement('section', { className: 'card settings-card' });

  section.append(createElement('h2', { textContent: 'Game setup' }));
  section.append(createElement('label', { textContent: 'Code length' }));

  const lengthGroup = createElement('div', { className: 'btn-group' });

  LENGTHS.forEach((option) => {
    const disabled = option > base;

    const button = createElement('button', {
      className: `btn${length === option ? ' active' : ''}`,
      textContent: String(option),
      attributes: disabled ? { disabled: 'true' } : {},
    });

    button.addEventListener('click', () => {
      if (!disabled) {
        onLengthChange(option);
      }
    });

    lengthGroup.append(button);
  });

  section.append(lengthGroup);
  section.append(createElement('label', { textContent: 'Numeral system' }));

  const baseGroup = createElement('div', { className: 'btn-group' });

  BASES.forEach((option) => {
    const button = createElement('button', {
      className: `btn${base === option.base ? ' active' : ''}`,
      textContent: option.label,
    });

    button.addEventListener('click', () => {
      onBaseChange(option.base);
    });

    baseGroup.append(button);
  });

  section.append(baseGroup);

  const possible = countPossibleSecrets(length, base);

  section.append(
    createElement('p', {
      className: 'hint',
      textContent: `Possible secrets: ${possible.toLocaleString()}`,
    }),
  );

  const startButton = createElement('button', {
    className: 'btn btn-primary',
    textContent: '✈  Start game',
  });

  startButton.addEventListener('click', onStart);

  section.append(startButton);

  return section;
};

export { createSettings };
