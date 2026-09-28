import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const types = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".jpg": "image/jpeg",
	".svg": "image/svg+xml",
	".md": "text/markdown; charset=utf-8",
};
const publicFiles = new Set([
	"index.html",
	"assets/site.css",
	"app.js",
	"theme.js",
	"assets/mark.svg",
	"assets/walkdown-detail.jpg",
	"assets/walkdown-review.jpg",
	"assets/walkdown-prototype.jpg",
	"assets/walkdown-feedback.jpg",
	"setup.md",
]);
// The bootstrap page an agent is pointed at ("visit walkdown.dev/setup").
// Markdown on purpose: an agent fetching a URL reliably gets text.
const aliases = new Map([["setup", "setup.md"]]);

export function createSiteServer() {
	return createServer(async (request, response) => {
		response.setHeader("X-Content-Type-Options", "nosniff");
		response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
		if (!["GET", "HEAD"].includes(request.method)) {
			response.writeHead(405, { Allow: "GET, HEAD" });
			return response.end("Method not allowed");
		}
		let file;
		try {
			file =
				decodeURIComponent(
					new URL(request.url, "http://localhost").pathname,
				).slice(1) || "index.html";
		} catch {
			response.writeHead(400);
			return response.end("Bad request");
		}
		file = aliases.get(file) ?? file;
		if (!publicFiles.has(file)) {
			response.writeHead(404);
			return response.end("Not found");
		}
		try {
			const body = await readFile(new URL(file, import.meta.url));
			response.writeHead(200, {
				"Content-Type": types[extname(file)],
				"Content-Length": body.length,
				"Cache-Control": "no-cache",
			});
			response.end(request.method === "HEAD" ? undefined : body);
		} catch {
			response.writeHead(500);
			response.end("Unable to load this asset");
		}
	});
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	const portFlag = process.argv.indexOf("--port");
	const port = Number(
		portFlag >= 0 ? process.argv[portFlag + 1] : process.env.PORT || 4789,
	);
	const host = process.env.HOST || "127.0.0.1";
	const server = createSiteServer();
	const watcher = process.argv.includes("--watch-css")
		? spawn(
				process.execPath,
				[
					fileURLToPath(
						new URL(
							"node_modules/@tailwindcss/cli/dist/index.mjs",
							import.meta.url,
						),
					),
					"-i",
					"style.css",
					"-o",
					"assets/site.css",
					"--minify",
					"--watch=always",
				],
				{ cwd: new URL(".", import.meta.url), stdio: "inherit" },
			)
		: null;
	let stopping = false;
	function stop(code = 0) {
		if (stopping) return;
		stopping = true;
		watcher?.kill("SIGTERM");
		server.close(() => process.exit(code));
	}
	watcher?.once("exit", (code) => {
		if (!stopping) stop(code || 1);
	});
	watcher?.once("error", (error) => {
		console.error(error.message);
		stop(1);
	});
	server.once("error", (error) => {
		console.error(error.message);
		stop(1);
	});
	server.listen(port, host, () =>
		console.log(`Walkdown site mockup: http://${host}:${port}`),
	);
	for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => stop());
}
