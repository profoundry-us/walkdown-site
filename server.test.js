import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createSiteServer } from "./server.js";

let server;
let base;
before(async () => {
	server = createSiteServer();
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

test("serves the page, code, stylesheet, and actual screenshots", async () => {
	for (const [path, type] of [
		["/", "text/html"],
		["/assets/site.css", "text/css"],
		["/app.js", "text/javascript"],
		["/theme.js", "text/javascript"],
		["/assets/walkdown-detail.jpg", "image/jpeg"],
		["/assets/mark.svg", "image/svg+xml"],
	]) {
		const response = await fetch(base + path);
		assert.equal(response.status, 200);
		assert.equal(response.headers.get("content-type").split(";")[0], type);
		assert.ok((await response.arrayBuffer()).byteLength > 0);
	}
});

test("supports HEAD without a response body", async () => {
	const response = await fetch(base, { method: "HEAD" });
	assert.equal(response.status, 200);
	assert.equal(await response.text(), "");
});

test("does not expose sources, research, or files outside the site", async () => {
	for (const path of [
		"/server.js",
		"/style.css",
		"/theme.test.js",
		"/package.json",
		"/research/claude.ai.png",
		"/assets/../server.js",
		"/assets/%2e%2e%2fserver.js",
		"/%E0%A4%A",
		"/missing",
	]) {
		const response = await fetch(base + path);
		assert.ok(
			[400, 404].includes(response.status),
			`${path}: ${response.status}`,
		);
	}
});

test("rejects methods that could mutate state", async () => {
	const response = await fetch(base, { method: "POST", body: "no writes" });
	assert.equal(response.status, 405);
	assert.equal(response.headers.get("allow"), "GET, HEAD");
});
