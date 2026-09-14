(() => {
	const key = "walkdown-site-theme";
	const system = window.matchMedia("(prefers-color-scheme: dark)");
	const valid = (value) =>
		["walkdown-light", "walkdown-dark"].includes(value) ? value : null;
	let preference = null;
	let button;
	try {
		preference = valid(localStorage.getItem(key));
	} catch {
		preference = null;
	}

	function applyTheme() {
		const theme =
			preference || (system.matches ? "walkdown-dark" : "walkdown-light");
		const dark = theme === "walkdown-dark";
		document.documentElement.dataset.theme = theme;
		document
			.querySelector('meta[name="theme-color"]')
			.setAttribute("content", dark ? "#183244" : "#f3fafc");
		if (button) {
			button.setAttribute(
				"aria-label",
				dark ? "Switch to light mode" : "Switch to dark mode",
			);
			button.setAttribute(
				"title",
				dark ? "Switch to light mode" : "Switch to dark mode",
			);
			button.setAttribute("aria-pressed", String(dark));
		}
	}

	applyTheme();
	system.addEventListener("change", applyTheme);
	window.addEventListener("storage", (event) => {
		if (event.key !== key && event.key !== null) return;
		preference = valid(event.newValue);
		applyTheme();
	});
	document.addEventListener("DOMContentLoaded", () => {
		button = document.getElementById("theme-toggle");
		applyTheme();
		button.addEventListener("click", () => {
			preference =
				document.documentElement.dataset.theme === "walkdown-dark"
					? "walkdown-light"
					: "walkdown-dark";
			applyTheme();
			const status = document.getElementById("theme-status");
			try {
				localStorage.setItem(key, preference);
				status.textContent = `${preference === "walkdown-dark" ? "Dark" : "Light"} theme selected.`;
			} catch {
				status.textContent =
					"Theme changed for this visit. Your browser prevented saving the preference.";
			}
		});
	});
})();
