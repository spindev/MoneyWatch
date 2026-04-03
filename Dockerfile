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
# VITE_IS_DOCKER enables the backup/restore section (only available with the Express server)
RUN env VITE_IS_DOCKER=true sh -c 'npx tsc -b && npx vite build --base /'

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy compiled frontend, server source, and ETF ticker list
COPY --from=builder /app/dist ./dist
COPY server/index.mjs ./server/index.mjs
COPY src/apps/portfolio/etfs.json ./server/etfs.json

EXPOSE 3000

CMD ["node", "server/index.mjs"]
