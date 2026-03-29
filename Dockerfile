# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Fetch finance data at build time (baked into the static assets)
RUN node scripts/fetch-finance-data.mjs

# Build with base "/" so the app is served from the root path in Docker
RUN npx tsc -b && npx vite build --base /

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM caddy:alpine

# Copy built assets into Caddy's default web root
COPY --from=builder /app/dist /srv

# SPA-aware Caddy config (gzip + try_files fallback to index.html)
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
