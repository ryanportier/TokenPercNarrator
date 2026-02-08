# ---------------------------
# Base (Node + pnpm)
# ---------------------------
FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable

# ---------------------------
# Build percolator-cli (pnpm)
# ---------------------------
FROM base AS cli-build
WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 https://github.com/aeyakovenko/percolator-cli.git
WORKDIR /build/percolator-cli

# Install + build (percolator-cli)
RUN pnpm install --no-frozen-lockfile
RUN pnpm build

# ---------------------------
# Runner (your Express API)
# ---------------------------
FROM base AS runner
WORKDIR /app

# Install runner deps
COPY package.json package-lock.json* ./
RUN npm install

# Copy runner source
COPY src ./src

# Copy percolator-cli into image
COPY --from=cli-build /build/percolator-cli /opt/percolator-cli

# Expose a "percolator" command for spawn("percolator", ...)
# percolator-cli binary lives in its node_modules/.bin
RUN printf '%s\n' \
'#!/bin/sh' \
'set -e' \
'if [ -x /opt/percolator-cli/node_modules/.bin/percolator ]; then exec /opt/percolator-cli/node_modules/.bin/percolator "$@"; fi' \
'if [ -x /opt/percolator-cli/node_modules/.bin/percolator-cli ]; then exec /opt/percolator-cli/node_modules/.bin/percolator-cli "$@"; fi' \
'echo "percolator bin not found in /opt/percolator-cli/node_modules/.bin" >&2' \
'ls -la /opt/percolator-cli/node_modules/.bin >&2 || true' \
'exit 127' \
> /usr/local/bin/percolator && chmod +x /usr/local/bin/percolator


ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start runner (it runs TS via tsx if your package.json uses tsx)
CMD ["npm", "run", "start"]

