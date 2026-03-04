# Build stage - Dashboard
FROM node:20-alpine AS dashboard-build
WORKDIR /app/dashboard
COPY dashboard/package*.json ./
RUN npm ci
COPY dashboard/ ./
RUN npm run build

# Build stage - API
FROM node:20-alpine AS api-build
WORKDIR /app/api
COPY api/package*.json ./
RUN npm ci --production

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy API
COPY api/ ./api/
COPY --from=api-build /app/api/node_modules ./api/node_modules

# Copy Dashboard build output
COPY --from=dashboard-build /app/dashboard/dist ./dashboard/dist

# Copy env file template
COPY .env.example ./.env.example

WORKDIR /app/api

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "index.js"]
