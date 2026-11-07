# Design Document

## 1. Project overview

**Bulls and Cows** is a browser game in which the player guesses a secret code consisting of unique digits. Before a round starts, the player selects the code length and numeral system. After each valid guess, the game reports the number of bulls (correct digits in the correct positions) and cows (correct digits in different positions).

The application is implemented in TypeScript. Game logic and state transitions are separated from the DOM-based user interface. The project uses Vite, Vitest, ESLint, Prettier, Husky, and lint-staged.

## 2. Data structures

### 2.1. Secret code and guesses

A secret code and a guess are represented as strings.

This representation has several advantages:

- It preserves leading zeroes. For example, `0123` remains a four-character code rather than being converted to the number `123`.
- It supports hexadecimal characters (`a`–`f`) as well as decimal digits.
- It makes positional comparison straightforward.

The secret is stored in `GameState.secret` as `string | null`. It is `null` before a round starts and contains the normalized lowercase code during a round.

### 2.2. Game settings

`GameSettings` contains two numeric properties:

- `length` — the required number of characters in the code;
- `base` — the numeral-system base (`2`, `8`, `10`, or `16`).

The available lengths and bases are declared in `src/settings/settings.ts`. The settings UI prevents selecting a code length greater than the selected base. When binary is selected, the application sets the code length to `2`.

### 2.3. Game state

`GameState`, declared in `src/game/gameState.ts`, contains:

- `settings` — the settings for the current round;
- `secret` — the secret code, or `null` before the round starts;
- `history` — an array of `GuessEntry` objects;
- `status` — one of `settings`, `playing`, or `won`;
- `startedAt` — the round start timestamp, or `null`;
- `finishedAt` — the winning timestamp, or `null`.

A `GuessEntry` stores the normalized guess and its `bulls` and `cows` counts.

The history is an array because guesses are appended in chronological order and rendered in that order. `submitGuess` creates a new array using `[...state.history, entry]` rather than modifying the previous history array.

### 2.4. Records

A `RecordEntry`, declared in `src/logic/records.ts`, stores:

- a record identifier;
- the number of attempts;
- the elapsed time in milliseconds;
- the code length and numeral-system base;
- a readable base label;
- the completion date.

Records are sorted first by ascending attempt count and then by ascending elapsed time. Only the first 10 records are retained. Settings and records are stored under separate `localStorage` keys.

### 2.5. Digit validator

`createDigitValidator(base)` creates a predicate for a selected numeral system. The predicate checks that its argument consists of exactly one character and belongs to the allowed digit alphabet for that base. It converts the character to lowercase, so hexadecimal input is case-insensitive.

The returned predicate is used by `isValidGuess` and by the game input handler in `src/ui/components/game.ts`.

## 3. Algorithms

### 3.1. `generateSecret(length, base, random)`

File: `src/logic/generateSecret.ts`

The function first creates an array containing the digit alphabet for the selected base. It then performs a partial Fisher–Yates shuffle. For each position from `0` to `length - 1`, it selects a random position from the unprocessed suffix and swaps the two elements. Finally, it takes the first `length` elements and joins them into a string.

This produces a code with no repeated digits. Since the alphabet starts with `0`, a leading zero is allowed.

The `random` parameter defaults to `Math.random`. Tests can supply a deterministic random function to make the generated result predictable. The algorithm assumes that the supplied random function returns values in the interval `[0, 1)`, as `Math.random` does.

### 3.2. `evaluateGuess(secret, guess)`

File: `src/logic/evaluateGuess.ts`

Both strings are converted to lowercase character arrays.

- **Bulls:** `reduce` traverses the guess digits and increments the count when a digit at the current position equals the corresponding secret digit.
- **Cows:** `map` replaces correctly positioned digits with `null`. `filter` then retains the remaining digits that occur in the secret. The number of retained digits is the cow count.

Because valid secrets and guesses contain unique digits, each matching digit can contribute at most once.

### 3.3. `isValidGuess(guess, length, base)`

File: `src/logic/isValidGuess.ts`

The function converts the guess to lowercase, creates a validator for the selected base, and checks three conditions:

1. The number of characters equals the required code length.
2. Every character passes the digit validator.
3. A `Set` built from the characters has the same size as the character array, which means that no digit is repeated.

The validator checks membership using `String.includes`. This is a scan of the allowed-digit string, not a constant-time `Set` lookup.

The function returns a boolean and does not access the DOM or browser storage.

### 3.4. `createDigitValidator(base)`

File: `src/logic/createDigitValidator.ts`

This function is a higher-order factory: the base is supplied first, and the returned function accepts a character and determines whether it is valid for that base.

The factory builds the allowed alphabet by taking the first `base` characters from `0123456789abcdef`. The returned predicate also checks that its input has exactly one character and normalizes its case before checking membership.

### 3.5. `countPossibleSecrets(length, base)`

File: `src/logic/countPossibleSecrets.ts`

The function counts possible arrangements of unique digits. Since a leading zero is allowed, no first-digit adjustment is required.

The recurrence is:

`P(base, length) = base × P(base - 1, length - 1)`

The base cases are:

- `length === 0` returns `1`, because there is one empty arrangement;
- negative arguments or `length > base` return `0`.

Computed results are stored in a module-level `Map`, keyed by the pair `length:base`. A repeated call with the same arguments returns the cached result.

The implementation makes one recursive call at each step. It does not branch into multiple recursive calls.

### 3.6. Game-state transitions

File: `src/game/gameState.ts`

The game state is managed by functions rather than a class:

- `createInitialState(settings)` creates the initial state for the settings screen.
- `startGame(state, secret, startedAt)` starts a round only if the current state is on the settings screen and the supplied secret is valid.
- `submitGuess(state, guess, now)` rejects guesses when the game is not active, when the guess is invalid, or when it has already been submitted. Otherwise, it evaluates the guess and returns a new state containing a new history array. If all digits are bulls, the returned state has status `won` and stores `finishedAt`.
- `resetGame(state)` returns a state without a secret or guess history and with status `settings`.

Timestamps are passed to state-transition functions as arguments rather than being read inside those functions. Their results therefore depend on explicit inputs.

## 4. Time and space complexity

Let:

- `b` be the numeral-system base (at most 16 in this application);
- `n` be the code length.

The analysis below describes the actual implementations in this repository. For `countPossibleSecrets`, it distinguishes a cache miss from a cache hit.

| Function                               |                               Time complexity |        Auxiliary space | Explanation                                                                                                                                                                                                     |
| -------------------------------------- | --------------------------------------------: | ---------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateSecret(length, base, random)` |                                    `O(b + n)` |                 `O(b)` | Creating the digit alphabet takes `O(b)`. The partial shuffle performs `n` iterations. Slicing and joining process at most `n` characters.                                                                      |
| `evaluateGuess(secret, guess)`         |                                       `O(n²)` |                 `O(n)` | The bulls reduction is `O(n)`. The cows calculation uses `map` and `filter`, but `secretDigits.includes` can scan up to `n` elements for each guess digit, resulting in `O(n²)` overall.                        |
| `isValidGuess(guess, length, base)`    |                                    `O(n × b)` |             `O(n + b)` | The validator builds an alphabet of up to `b` characters. For each of the `n` input characters, `validDigits.includes(...)` may scan up to `b` characters. Creating the character array and `Set` takes `O(n)`. |
| `countPossibleSecrets(length, base)`   | `O(n)` on a cache miss; `O(1)` on a cache hit | `O(n)` on a cache miss | An uncached call follows one recursive chain, decreasing both arguments by one at each step. The recursion stack and newly stored cache entries use `O(n)` space for that call.                                 |

The `Map` used by `countPossibleSecrets` persists between calls. A previously calculated `(length, base)` pair can therefore be returned in constant expected time. The recurrence does not explore a branching recursion tree: each call makes only one recursive call.

## 5. Functional programming and clean-code practices

### Pure game-logic functions

The core game algorithms — `generateSecret`, `evaluateGuess`, `isValidGuess`, `createDigitValidator`, and `countPossibleSecrets` — do not access the DOM or browser storage.

`generateSecret` receives its random source as an argument, and game-state transitions receive timestamps as arguments. This makes their results reproducible when the same inputs are supplied.

`src/game/gameState.ts` expresses state transitions as functions that return new state objects instead of mutating the supplied state.

**Side-effect boundary:** `src/logic/records.ts` contains browser-storage operations through `localStorage` and creates record metadata using `Date` and `Math.random`. `src/settings/settingsStorage.ts` also reads from and writes to `localStorage`. These modules handle persistence and are not pure functions.

### Immutability

`submitGuess` creates a new history array using `[...state.history, entry]` and returns a new state object. `startGame` and `resetGame` also return new state objects. These transitions do not modify the supplied state object or its history array.

### Higher-order functions and declarative array operations

`evaluateGuess` uses `reduce`, `map`, and `filter` to calculate the bulls and cows counts. `isValidGuess` uses `every` to validate all characters. `createDigitValidator` returns a predicate that is reused by guess validation and input filtering.

### Single-purpose modules

The source code is separated by responsibility:

- `src/logic/` contains game algorithms and record persistence;
- `src/game/` contains game-state types and transitions;
- `src/settings/` contains settings definitions and persistence;
- `src/ui/` contains DOM rendering and event handling;
- `src/utils/createElement.ts` centralizes DOM element creation.

The UI creates DOM nodes and uses `textContent` to insert text. It does not build dynamic markup with `innerHTML` or `insertAdjacentHTML`.

### Explicit types

The project defines types for game settings, game state, game status, guesses, submit results, and records. The TypeScript configuration enables `strict` mode. Explicit types are used for important data structures and function boundaries.

## 6. Testing approach

The project uses Vitest. The required game-logic functions have corresponding test files in `src/logic/`:

- `generateSecret.test.ts`
- `evaluateGuess.test.ts`
- `isValidGuess.test.ts`
- `createDigitValidator.test.ts`
- `countPossibleSecrets.test.ts`

The tests for secret generation can supply a deterministic random function instead of relying on uncontrolled randomness. This makes generated results reproducible.

The `test` script in `package.json` runs the Vitest test suite.

The presence of these test files confirms that the functions have corresponding tests. The order in which tests and implementations were committed must be verified through the Git commit history.

## 7. Persistence

Settings are loaded and saved by `src/settings/settingsStorage.ts` under the `bulls-and-cows-settings` key.

`loadSettings` validates the parsed settings and returns `DEFAULT_SETTINGS` if the stored value is missing, invalid, or cannot be parsed.

Leaderboard records are loaded and saved by `src/logic/records.ts` under the `bulls-and-cows-records` key. Records are sorted by the number of attempts and then by elapsed time. The stored list is limited to 10 entries.

`loadRecords` returns an empty array if the stored value is missing, cannot be parsed, or is not an array. It does not validate the structure of individual record entries within that array.

`saveSettings` and `saveRecords` serialize their data as JSON and write it to `localStorage`.
