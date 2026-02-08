# ---- build percolator-cli (rust) ----
FROM rust:1.78-bookworm AS build

WORKDIR /build

# (A) Clona percolator-cli
RUN git clone https://github.com/aeyakovenko/percolator-cli.git

WORKDIR /build/percolator-cli

# Build release
RUN cargo build --release

# ---- runtime (node) ----
FROM node:20-bookworm-slim AS runtime

WORKDIR /app

# Copy percolator-cli binary
COPY --from=build /build/percolator-cli/target/release/percolator /usr/local/bin/percolator

# Install node deps
COPY package.json /app/package.json
RUN npm install --omit=dev

# Copy source
COPY src /app/src

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["npm", "run", "start"]
