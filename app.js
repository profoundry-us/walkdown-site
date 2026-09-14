const tabs = [...document.querySelectorAll("[data-tab]")];

function selectTab(tab) {
	for (const item of tabs) {
		const selected = item === tab;
		item.setAttribute("aria-selected", String(selected));
		item.tabIndex = selected ? 0 : -1;
		document.getElementById(item.getAttribute("aria-controls")).hidden =
			!selected;
	}
}

for (const tab of tabs) {
	tab.addEventListener("click", () => selectTab(tab));
	tab.addEventListener("keydown", (event) => {
		const index = tabs.indexOf(tab);
		const next = {
			ArrowRight: (index + 1) % tabs.length,
			ArrowLeft: (index + tabs.length - 1) % tabs.length,
			Home: 0,
			End: tabs.length - 1,
		}[event.key];
		if (next === undefined) return;
		event.preventDefault();
		selectTab(tabs[next]);
		tabs[next].focus();
	});
}

const comparison = document.querySelector(".comparison");
const slider = document.getElementById("compare-slider");
function updateComparison(value) {
	slider.value = String(Math.max(0, Math.min(100, value)));
	comparison.style.setProperty("--split", `${slider.value}%`);
	slider.setAttribute("aria-valuetext", `${slider.value}% design revealed`);
}
slider.addEventListener("input", () => updateComparison(Number(slider.value)));
function dragComparison(event) {
	const box = comparison.getBoundingClientRect();
	updateComparison(Math.round(((event.clientX - box.left) / box.width) * 100));
}
comparison.addEventListener("pointerdown", (event) => {
	if (event.button !== 0) return;
	comparison.setPointerCapture(event.pointerId);
	dragComparison(event);
});
comparison.addEventListener("pointermove", (event) => {
	if (comparison.hasPointerCapture(event.pointerId)) dragComparison(event);
});
comparison.addEventListener("dragstart", (event) => event.preventDefault());

const lightbox = document.querySelector(".lightbox");
const image = document.getElementById("lightbox-image");
const caption = document.getElementById("lightbox-caption");
for (const trigger of document.querySelectorAll("[data-zoom]")) {
	trigger.addEventListener("click", () => {
		image.src = trigger.dataset.zoom;
		image.alt = trigger.querySelector("img").alt;
		caption.textContent = trigger.dataset.caption;
		lightbox.showModal();
		document.body.style.overflow = "hidden";
	});
}
lightbox
	.querySelector(".lightbox-close")
	.addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
	const box = lightbox.getBoundingClientRect();
	if (
		event.clientX < box.left ||
		event.clientX > box.right ||
		event.clientY < box.top ||
		event.clientY > box.bottom
	)
		lightbox.close();
});
lightbox.addEventListener("close", () => {
	document.body.style.overflow = "";
});

const menu = document.querySelector(".menu-toggle");
const navigation = document.getElementById("navigation");
function closeMenu() {
	menu.setAttribute("aria-expanded", "false");
	navigation.classList.remove("is-open");
}
menu.addEventListener("click", () => {
	const open = menu.getAttribute("aria-expanded") !== "true";
	menu.setAttribute("aria-expanded", String(open));
	navigation.classList.toggle("is-open", open);
});
for (const link of navigation.querySelectorAll("a"))
	link.addEventListener("click", closeMenu);
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
		closeMenu();
		menu.focus();
	}
});

const copyButton = document.getElementById("copy-prompt");
const copyStatus = document.getElementById("copy-status");
let copyTimer;
copyButton.addEventListener("click", async () => {
	const prompt = document.getElementById("setup-prompt");
	clearTimeout(copyTimer);
	try {
		await navigator.clipboard.writeText(prompt.textContent);
		copyButton.textContent = "Copied ✓";
		copyStatus.textContent = "Setup prompt copied to clipboard.";
	} catch {
		const range = document.createRange();
		range.selectNodeContents(prompt);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		copyButton.textContent = "Select & copy";
		copyStatus.textContent =
			"Clipboard unavailable. The prompt is selected; use your usual copy shortcut.";
	}
	copyTimer = setTimeout(() => {
		copyButton.textContent = "Copy prompt ⧉";
	}, 3000);
});
