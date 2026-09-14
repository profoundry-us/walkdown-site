# Walkdown site mockup

This is an independent marketing-site mockup, not part of the sibling Walkdown application's blueprint. Do not change `../walkdown` to work on this site.

## Development and verification

- Node 20 or newer. Run `npm ci` to install the pinned Tailwind CSS 4.3.3, Tailwind CLI 4.3.3, and daisyUI 5.7.35 build dependencies.
- `npm run dev` builds the stylesheet and starts the local server at `http://localhost:4789`, with a Tailwind watcher and Node's server watcher. Refresh the browser after edits. Stopping the server also stops the CSS watcher.
- `npm run dev -- --port 4800` chooses another port.
- `npm run build` compiles `style.css` into `assets/site.css`. Never edit the generated CSS. `npm start` builds and serves without watchers.
- `npm test` builds the stylesheet and runs the HTTP-server and theme-state tests. `node --check app.js` and `node --check theme.js` check browser JavaScript syntax.
- For browser verification, check 320, 390, 768, 1024, and 1440px widths in both themes; all three tour tabs including arrow-key navigation; drag and keyboard control of the screenshot comparison; screenshot dialogs and Escape/focus return; mobile navigation; FAQ disclosure; and clipboard success/failure feedback. Also verify system color-scheme preference, persisted theme selection, and storage-denied behavior.
- `index.html`, `app.js`, and the pre-paint `theme.js` are served directly. `server.js` exposes only an explicit list of public assets; add new public assets there as needed. Stylesheet source, research captures, and project files are intentionally not served.
- `style.css` defines both modes using daisyUI's `theme` plugin. `walkdown-dark` reproduces the app's blueprint palette; `walkdown-light` is its light counterpart. All site colors use semantic daisyUI tokens. Component customizations live in the utilities layer to take precedence over daisyUI's nested component layers.
- Body copy is 18px on desktop and 16px at narrower widths; hero copy is 20px/18px. Links, buttons, and tour tabs stay at least 16px. Supporting labels stay at least 12px. Reflow layouts rather than shrinking text on phones.

## Assets and product claims

- The four `assets/walkdown-*.jpg` images are real captures of the running Walkdown example project at 1440 × 780, captured September 10, 2026. They show actual example data, not current verification of another project.
- No verdicts or feedback were submitted to produce the images. The site's comparison is a wipe between captured images, not a live embedded app; its caption says so.
- `research/` holds visual references from Highball, the previous Claude artifact, Linear, Zed, Raycast, Warp, and Resend, plus mockup review captures. Third-party screenshots are research only and must not be used as marketing assets.
- Typography is Manrope, Instrument Serif, and DM Mono, loaded from Google Fonts, with local fallbacks. There are no analytics.
- The agent setup prompt points to the public GitHub setup guide. `walkdown.dev/setup` could not be reached during implementation; do not assume it is live.
- Walkdown installs from its Git clone, not npm. It links existing tests and keeps checks, agent judgments, and human role signoffs distinct. Avoid invented endorsements, adoption statistics, or automated-human-acceptance claims.

## Deployment

- Staging is the Fly.io app `walkdown-site-staging` in the Profoundry org (region `dfw`), served at `https://staging.walkdown.dev`. `fly deploy` from this directory builds the `Dockerfile` (Tailwind build stage, then `node server.js` on port 8080 with `HOST=0.0.0.0`) and ships it. There is no production app yet.
- DNS for `walkdown.dev` is on Cloudflare (zone `walkdown.dev`, DNS-only A/AAAA records pointing at the Fly app's IPs, not proxied, so Fly terminates TLS with its own certificate). Changing the app's IPs means updating those records and re-running `fly certs check staging.walkdown.dev`.
- `server.js` binds to `127.0.0.1` unless `HOST` is set; the container sets it. `.dockerignore` keeps `research/`, tests, and `node_modules` out of the image, and the server's public-file list still governs what is served.
