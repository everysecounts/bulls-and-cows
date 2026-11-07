import type { GameState } from '@/game';
import { createElement } from '@/utils/createElement';

type GameProps = {
  state: GameState;
};

const createGame = ({ state }: GameProps): HTMLElement => {
  return createElement('section', { className: 'card' }, [
    createElement('p', {
      textContent: `Playing · length ${state.settings.length} · base ${state.settings.base}`,
    }),
    createElement('p', {
      className: 'hint',
      textContent: `Secret generated (${state.secret?.length ?? 0} digits)`,
    }),
  ]);
};

export { createGame };
