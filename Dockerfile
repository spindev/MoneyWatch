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
FROM node:20-alpine

RUN npm install -g serve@14.2.6

COPY --from=builder /app/dist /srv

EXPOSE 3000

CMD ["serve", "-s", "-l", "3000", "/srv"]
