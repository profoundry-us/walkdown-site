import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("./theme.js", import.meta.url), "utf8");

function setup({ saved = null, dark = false, blocked = false } = {}) {
	const events = {};
	const attributes = {};
	const root = { dataset: {} };
	const media = {
		matches: dark,
		addEventListener: (_, callback) => {
			events.system = callback;
		},
	};
	const button = {
		setAttribute: (name, value) => {
			attributes[name] = value;
		},
		addEventListener: (_, callback) => {
			events.toggle = callback;
		},
	};
	const meta = {
		setAttribute: (_, value) => {
			attributes.meta = value;
		},
	};
	const status = { textContent: "" };
	const storage = {
		getItem: () => {
			if (blocked) throw new Error("Storage blocked");
			return saved;
		},
		setItem: (_, value) => {
			if (blocked) throw new Error("Storage blocked");
			saved = value;
		},
	};
	runInNewContext(source, {
		window: {
			matchMedia: () => media,
			addEventListener: (name, callback) => {
				events[name] = callback;
			},
		},
		localStorage: storage,
		document: {
			documentElement: root,
			querySelector: () => meta,
			getElementById: (id) => (id === "theme-toggle" ? button : status),
			addEventListener: (_, callback) => {
				events.ready = callback;
			},
		},
	});
	events.ready();
	return { root, attributes, events, media, storage, status };
}

test("theme follows system preference until explicitly selected", () => {
	const state = setup({ dark: true });
	assert.equal(state.root.dataset.theme, "walkdown-dark");
	state.media.matches = false;
	state.events.system();
	assert.equal(state.root.dataset.theme, "walkdown-light");
	assert.equal(state.attributes["aria-pressed"], "false");
});

test("saved theme overrides system preference and toggle persists", () => {
	const state = setup({ saved: "walkdown-light", dark: true });
	assert.equal(state.root.dataset.theme, "walkdown-light");
	state.events.toggle();
	assert.equal(state.root.dataset.theme, "walkdown-dark");
	assert.equal(state.storage.getItem(), "walkdown-dark");
	assert.equal(state.attributes["aria-label"], "Switch to light mode");
	assert.equal(state.attributes["aria-pressed"], "true");
	state.media.matches = false;
	state.events.system();
	assert.equal(state.root.dataset.theme, "walkdown-dark");
});

test("invalid saved themes fall back to the system", () => {
	assert.equal(
		setup({ saved: "unexpected", dark: true }).root.dataset.theme,
		"walkdown-dark",
	);
});

test("blocked local storage still permits theme changes", () => {
	const state = setup({ blocked: true });
	state.events.toggle();
	assert.equal(state.root.dataset.theme, "walkdown-dark");
	assert.match(state.status.textContent, /this visit/);
});

test("theme changes sync across tabs and clearing storage restores system mode", () => {
	const state = setup();
	state.events.storage({
		key: "walkdown-site-theme",
		newValue: "walkdown-dark",
	});
	assert.equal(state.root.dataset.theme, "walkdown-dark");
	state.events.storage({ key: null, newValue: null });
	assert.equal(state.root.dataset.theme, "walkdown-light");
});
