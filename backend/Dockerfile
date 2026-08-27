# ==========================================
# Multi-stage Dockerfile for Production
# ==========================================

# 1. Dependency & Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (e.g. argon2)
RUN apk add --no-cache python3 make g++

# Copy package descriptors
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and config
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src/

# Compile production bundle
RUN npm run build

# Prune dev dependencies for lean runtime footprint
RUN npm prune --production

# ==========================================
# 2. Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install curl for container healthchecks
RUN apk add --no-cache curl

# Create non-root system group and user
RUN addgroup -S -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nestjs

# Copy runtime node_modules and built dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start production server
CMD ["node", "dist/main.js"]
