# Build the stylesheet with the pinned Tailwind/daisyUI toolchain, then serve
# with the site's own Node server (no runtime dependencies).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY style.css index.html ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
COPY package.json server.js app.js theme.js index.html setup.md ./
COPY assets ./assets
COPY --from=build /app/assets/site.css ./assets/site.css
EXPOSE 8080
CMD ["node", "server.js"]
