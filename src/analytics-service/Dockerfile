# ── Stage 1: Install prod deps ───────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy manifests first — layer is cached until package.json changes
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Non-root user (built into node:alpine as uid 1000)
USER node

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node index.js .

EXPOSE 8003

CMD ["node", "index.js"]
