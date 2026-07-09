# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install ALL dependencies (devDeps needed for prisma CLI + ts compiler)
COPY package*.json ./
RUN npm ci

# Copy source files — intentionally NO prisma.config.ts here
# (prisma generate doesn't need DATABASE_URL; config.ts would force validation at build time)
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client (reads schema only, no DB connection needed)
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled app
COPY --from=builder /app/dist ./dist

# Copy Prisma generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma CLI from builder (needed for migrate deploy at runtime)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Copy migrations + prisma.config.ts (needed by prisma migrate deploy at runtime)
# DATABASE_URL will be injected by Docker Compose at container start — NOT build time
COPY prisma ./prisma
COPY prisma.config.ts ./

EXPOSE 5000

# Run migrations then start server
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/server.js"]
