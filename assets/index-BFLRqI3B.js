// \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
// src/logic/generateSecret.ts
var generateSecret = (length, base, random = Math.random) => {
	const digits = Array.from({ length: base }, (_, index) => index.toString(16));
	for (let index = 0; index < length; index += 1) {
		const randomIndex = index + Math.floor(random() * (base - index));
		[digits[index], digits[randomIndex]] = [digits[randomIndex], digits[index]];
	}
	return digits.slice(0, length).join("");
};
// src/logic/records.ts
var STORAGE_KEY = "bulls-and-cows-records";
var MAX_RECORDS = 10;
var BASE_LABEL = {
	2: "bin",
	8: "oct",
	10: "dec",
	16: "hex"
};
var loadRecords = () => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch {
		return [];
	}
};
var saveRecords = (records) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
};
var addRecord = (attempts, timeMs, length, base) => {
	const entry = {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		attempts,
		timeMs,
		length,
		base,
		baseLabel: BASE_LABEL[base] ?? String(base),
		date: (/* @__PURE__ */ new Date()).toISOString()
	};
	const top = [...loadRecords(), entry].sort((a, b) => {
		if (a.attempts !== b.attempts) return a.attempts - b.attempts;
		return a.timeMs - b.timeMs;
	}).slice(0, MAX_RECORDS);
	saveRecords(top);
	return top;
};
// src/logic/evaluateGuess.ts
var evaluateGuess = (secret, guess) => {
	const secretDigits = [...secret.toLowerCase()];
	const guessDigits = [...guess.toLowerCase()];
	return {
		bulls: guessDigits.reduce((count, digit, index) => count + Number(digit === secretDigits[index]), 0),
		cows: guessDigits.map((digit, index) => digit === secretDigits[index] ? null : digit).filter((digit) => digit !== null && secretDigits.includes(digit)).length
	};
};
// src/logic/createDigitValidator.ts
var createDigitValidator = (base) => {
	const validDigits = "0123456789abcdef".slice(0, base);
	return (char) => {
		return char.length === 1 && validDigits.includes(char.toLowerCase());
	};
};
// src/logic/isValidGuess.ts
var isValidGuess = (guess, length, base) => {
	const isValidDigit = createDigitValidator(base);
	const digits = [...guess.toLowerCase()];
	return digits.length === length && digits.every(isValidDigit) && new Set(digits).size === digits.length;
};
// src/game/gameState.ts
var createInitialState = (settings) => ({
	settings,
	secret: null,
	history: [],
	status: "settings",
	startedAt: null,
	finishedAt: null
});
var startGame = (state, secret, startedAt) => {
	if (state.status !== "settings" || !isValidGuess(secret, state.settings.length, state.settings.base)) return state;
	return {
		...state,
		secret: secret.toLowerCase(),
		history: [],
		status: "playing",
		startedAt,
		finishedAt: null
	};
};
var submitGuess = (state, guess, now) => {
	if (state.status !== "playing" || state.secret === null) return {
		success: false,
		state,
		reason: "not-playing"
	};
	const normalizedGuess = guess.toLowerCase();
	if (!isValidGuess(normalizedGuess, state.settings.length, state.settings.base)) return {
		success: false,
		state,
		reason: "invalid-guess"
	};
	if (state.history.some((entry) => entry.guess === normalizedGuess)) return {
		success: false,
		state,
		reason: "duplicate-guess"
	};
	const result = evaluateGuess(state.secret, normalizedGuess);
	const entry = {
		guess: normalizedGuess,
		bulls: result.bulls,
		cows: result.cows
	};
	const history = [...state.history, entry];
	const won = result.bulls === state.settings.length;
	return {
		success: true,
		state: {
			...state,
			history,
			status: won ? "won" : "playing",
			finishedAt: won ? now : null
		}
	};
};
var resetGame = (state) => ({
	...state,
	secret: null,
	history: [],
	status: "settings",
	startedAt: null,
	finishedAt: null
});
// src/settings/settings.ts
var LENGTHS = [
	2,
	3,
	4,
	5,
	6
];
var BASES = [
	{
		label: "bin",
		base: 2
	},
	{
		label: "oct",
		base: 8
	},
	{
		label: "dec",
		base: 10
	},
	{
		label: "hex",
		base: 16
	}
];
var SETTINGS_STORAGE_KEY = "bulls-and-cows-settings";
var DEFAULT_SETTINGS = {
	length: 2,
	base: 2
};
// src/settings/settingsStorage.ts
var loadSettings = () => {
	try {
		const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
		if (!stored) return DEFAULT_SETTINGS;
		const parsed = JSON.parse(stored);
		if (typeof parsed !== "object" || parsed === null) return DEFAULT_SETTINGS;
		const { length, base } = parsed;
		if (typeof length !== "number" || typeof base !== "number") return DEFAULT_SETTINGS;
		if (!LENGTHS.includes(length) || !BASES.some((item) => item.base === base) || length > base) return DEFAULT_SETTINGS;
		return {
			length,
			base
		};
	} catch {
		return DEFAULT_SETTINGS;
	}
};
var saveSettings = (length, base) => {
	localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
		length,
		base
	}));
};
// src/utils/createElement.ts
function createElement(tagName, options = {}, children = []) {
	const element = document.createElement(tagName);
	const { className, textContent, attributes = {} } = options;
	if (className) element.className = className;
	if (textContent !== void 0) element.textContent = textContent;
	Object.entries(attributes).forEach(([name, value]) => {
		element.setAttribute(name, value);
	});
	children.forEach((child) => {
		element.append(child);
	});
	return element;
}
// src/ui/components/game.ts
var createGame = ({ state, onGuess }) => {
	const section = createElement("section", { className: "card game-card" });
	const { length, base } = state.settings;
	section.append(createElement("div", { className: "meta" }, [
		createElement("span", { textContent: `Code length: ${length}` }),
		createElement("span", { textContent: `System: ${{
			2: "bin",
			8: "oct",
			10: "dec",
			16: "hex"
		}[base] ?? base}` }),
		createElement("span", { textContent: `Attempts: ${state.history.length}` })
	]));
	const isDigit = createDigitValidator(base);
	const inputRow = createElement("div", { className: "input-row" });
	const input = createElement("input", {
		className: "guess-input",
		attributes: {
			type: "text",
			maxlength: String(length),
			placeholder: `${length} unique digits`,
			autocomplete: "off",
			spellcheck: "false"
		}
	});
	const submitButton = createElement("button", {
		className: "btn btn-primary btn-guess",
		textContent: "Check code",
		attributes: { disabled: "true" }
	});
	const updateSubmitButton = () => {
		const isValid = input.value.length === length && new Set(input.value).size === length;
		submitButton.disabled = !isValid || state.status !== "playing";
	};
	input.addEventListener("input", () => {
		const filteredDigits = [];
		for (const char of input.value.toLowerCase()) {
			if (isDigit(char) && !filteredDigits.includes(char)) filteredDigits.push(char);
			if (filteredDigits.length === length) break;
		}
		const filteredValue = filteredDigits.join("");
		if (input.value !== filteredValue) input.value = filteredValue;
		updateSubmitButton();
	});
	input.addEventListener("keydown", (event) => {
		if (event.key === "Enter" && !submitButton.disabled) onGuess(input.value);
	});
	submitButton.addEventListener("click", () => {
		onGuess(input.value);
	});
	inputRow.append(input, submitButton);
	section.append(inputRow);
	section.append(createElement("h3", { textContent: "Flight log / Guess history" }));
	const historyList = createElement("ul", { className: "history" });
	if (state.history.length === 0) historyList.append(createElement("li", {
		className: "empty",
		textContent: "No guesses yet"
	}));
	else state.history.forEach((entry) => {
		const guessElement = createElement("span", { className: "guess" });
		[...entry.guess].forEach((digit, index) => {
			const normalizedDigit = digit.toLowerCase();
			const secret = state.secret?.toLowerCase() ?? "";
			const isBull = normalizedDigit === secret[index];
			const isCow = !isBull && secret.includes(normalizedDigit);
			const className = isBull ? "guess-digit guess-digit-bull" : isCow ? "guess-digit guess-digit-cow" : "guess-digit";
			guessElement.append(createElement("span", {
				className,
				textContent: digit
			}));
		});
		historyList.append(createElement("li", { className: "history-item" }, [guessElement, createElement("span", {
			className: "result",
			textContent: `Bulls: ${entry.bulls} · Cows: ${entry.cows}`
		})]));
	});
	section.append(historyList);
	requestAnimationFrame(() => {
		historyList.scrollTop = historyList.scrollHeight;
	});
	return section;
};
// src/ui/components/header.ts
var createHeader = ({ onNewGame, onLeaderboard }) => {
	const header = createElement("header", { className: "header" });
	header.append(createElement("h1", { textContent: "Bulls and Cows" }), createElement("p", {
		className: "subtitle",
		textContent: "Guess the secret number of unique digits"
	}));
	const actions = createElement("div", { className: "header-actions" });
	if (onNewGame) {
		const newGameButton = createElement("button", {
			className: "btn btn-header",
			textContent: "New game"
		});
		newGameButton.setAttribute("type", "button");
		newGameButton.addEventListener("click", onNewGame);
		actions.append(newGameButton);
	}
	const leaderboardButton = createElement("button", {
		className: "btn btn-header",
		textContent: "Leaderboard"
	});
	leaderboardButton.setAttribute("type", "button");
	leaderboardButton.addEventListener("click", onLeaderboard);
	actions.append(leaderboardButton);
	header.append(actions);
	return header;
};
// src/logic/countPossibleSecrets.ts
var cache = /* @__PURE__ */ new Map();
var countPossibleSecrets = (length, base) => {
	if (length < 0 || base < 0 || length > base) return 0;
	if (length === 0) return 1;
	const cacheKey = `${length}:${base}`;
	const cachedResult = cache.get(cacheKey);
	if (cachedResult !== void 0) return cachedResult;
	const result = base * countPossibleSecrets(length - 1, base - 1);
	cache.set(cacheKey, result);
	return result;
};
// src/ui/components/settings.ts
var createSettings = ({ length, base, onLengthChange, onBaseChange, onStart }) => {
	const section = createElement("section", { className: "card settings-card" });
	section.append(createElement("h2", { textContent: "Game setup" }));
	section.append(createElement("label", { textContent: "Code length" }));
	const lengthGroup = createElement("div", { className: "btn-group" });
	LENGTHS.forEach((option) => {
		const disabled = option > base;
		const button = createElement("button", {
			className: `btn${length === option ? " active" : ""}`,
			textContent: String(option),
			attributes: disabled ? { disabled: "true" } : {}
		});
		button.addEventListener("click", () => {
			if (!disabled) onLengthChange(option);
		});
		lengthGroup.append(button);
	});
	section.append(lengthGroup);
	section.append(createElement("label", { textContent: "Numeral system" }));
	const baseGroup = createElement("div", { className: "btn-group" });
	BASES.forEach((option) => {
		const button = createElement("button", {
			className: `btn${base === option.base ? " active" : ""}`,
			textContent: option.label
		});
		button.addEventListener("click", () => {
			onBaseChange(option.base);
		});
		baseGroup.append(button);
	});
	section.append(baseGroup);
	const possible = countPossibleSecrets(length, base);
	section.append(createElement("p", {
		className: "hint",
		textContent: `Possible secrets: ${possible.toLocaleString()}`
	}));
	const startButton = createElement("button", {
		className: "btn btn-primary",
		textContent: "✈  Start game"
	});
	startButton.addEventListener("click", onStart);
	section.append(startButton);
	return section;
};
// src/ui/components/win.ts
var formatTime = (ms) => {
	const totalSeconds = Math.floor(ms / 1e3);
	return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
};
var createWin = ({ state, onNewGame }) => {
	const dialog = createElement("dialog", { className: "win-dialog" });
	dialog.addEventListener("click", (event) => {
		if (event.target === dialog) dialog.close();
	});
	dialog.addEventListener("cancel", (event) => {
		event.preventDefault();
		dialog.close();
	});
	const closeButton = createElement("button", {
		className: "win-close",
		textContent: "×"
	});
	closeButton.setAttribute("type", "button");
	closeButton.setAttribute("aria-label", "Close dialog");
	closeButton.addEventListener("click", () => {
		dialog.close();
	});
	dialog.append(closeButton);
	const timeMs = state.startedAt !== null && state.finishedAt !== null ? state.finishedAt - state.startedAt : 0;
	const content = createElement("div", { className: "win-content" });
	content.append(createElement("h2", { textContent: "You have arrived!" }), createElement("p", {
		className: "win-secret",
		textContent: `Secret: ${state.secret}`
	}), createElement("p", {
		className: "win-stats",
		textContent: `Attempts: ${state.history.length} · Time: ${formatTime(timeMs)}`
	}));
	const newGameButton = createElement("button", {
		className: "btn btn-primary",
		textContent: "New game"
	});
	newGameButton.addEventListener("click", onNewGame);
	content.append(newGameButton);
	dialog.append(content);
	return dialog;
};
// src/ui/app.ts
var createApp = (root) => {
	const savedSettings = loadSettings();
	let selectedLength = savedSettings.length;
	let selectedBase = savedSettings.base;
	let state = createInitialState({
		length: selectedLength,
		base: selectedBase
	});
	let records = loadRecords();
	const formatTime = (ms) => {
		const totalSeconds = Math.floor(ms / 1e3);
		return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
	};
	const createRecordsDialog = () => {
		const dialog = createElement("dialog", { className: "records-dialog" });
		const closeButton = createElement("button", {
			className: "records-close",
			textContent: "×"
		});
		closeButton.setAttribute("type", "button");
		closeButton.setAttribute("aria-label", "Close leaderboard");
		closeButton.addEventListener("click", () => {
			dialog.close();
		});
		dialog.addEventListener("click", (event) => {
			if (event.target === dialog) dialog.close();
		});
		const content = createElement("div", { className: "records-content" });
		content.append(createElement("h2", { textContent: "Leaderboard" }));
		if (records.length === 0) content.append(createElement("p", {
			className: "empty",
			textContent: "No records yet"
		}));
		else {
			const table = createElement("table", { className: "records-table" });
			const thead = createElement("thead", {}, [createElement("tr", {}, [
				createElement("th", { textContent: "#" }),
				createElement("th", { textContent: "Attempts" }),
				createElement("th", { textContent: "Time" }),
				createElement("th", { textContent: "Settings" })
			])]);
			const tbody = createElement("tbody");
			records.forEach((record, index) => {
				const row = createElement("tr", {}, [
					createElement("td", { textContent: String(index + 1) }),
					createElement("td", { textContent: String(record.attempts) }),
					createElement("td", { textContent: formatTime(record.timeMs) }),
					createElement("td", { textContent: `${record.length} / ${record.baseLabel}` })
				]);
				tbody.append(row);
			});
			table.append(thead, tbody);
			content.append(table);
		}
		dialog.append(closeButton, content);
		return dialog;
	};
	const handleOpenLeaderboard = () => {
		const dialog = createRecordsDialog();
		root.append(dialog);
		dialog.showModal();
		dialog.addEventListener("close", () => {
			dialog.remove();
		});
	};
	const render = () => {
		root.replaceChildren(createHeader({
			onNewGame: state.status !== "settings" ? handleNewGame : void 0,
			onLeaderboard: handleOpenLeaderboard
		}));
		if (state.status === "settings") {
			root.append(createSettings({
				length: selectedLength,
				base: selectedBase,
				onLengthChange: handleLengthChange,
				onBaseChange: handleBaseChange,
				onStart: handleStart
			}));
			return;
		}
		root.append(createGame({
			state,
			onGuess: handleGuess
		}));
		if (state.status === "won") {
			const winDialog = createWin({
				state,
				onNewGame: handleNewGame
			});
			root.append(winDialog);
			winDialog.showModal();
		}
	};
	const handleLengthChange = (length) => {
		selectedLength = length;
		saveSettings(selectedLength, selectedBase);
		render();
	};
	const handleBaseChange = (base) => {
		selectedBase = base;
		if (base === 2) selectedLength = 2;
		else if (selectedLength > base) selectedLength = base;
		saveSettings(selectedLength, selectedBase);
		render();
	};
	const handleStart = () => {
		const settings = {
			length: selectedLength,
			base: selectedBase
		};
		state = createInitialState(settings);
		const secret = generateSecret(settings.length, settings.base);
		state = startGame(state, secret, Date.now());
		render();
	};
	const handleGuess = (guess) => {
		const result = submitGuess(state, guess, Date.now());
		state = result.state;
		if (result.success && result.state.status === "won" && result.state.startedAt !== null && result.state.finishedAt !== null) records = addRecord(result.state.history.length, result.state.finishedAt - result.state.startedAt, result.state.settings.length, result.state.settings.base);
		render();
	};
	const handleNewGame = () => {
		state = resetGame(state);
		render();
	};
	render();
};
// src/main.ts
createApp(document.body);

//# sourceMappingURL=index-BFLRqI3B.js.map