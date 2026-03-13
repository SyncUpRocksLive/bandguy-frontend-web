# Stage 1: Build
FROM node:20.11.1-alpine AS builder
WORKDIR /app
COPY express_server/package*.json ./
RUN npm ci

COPY express_server/*.ts .
COPY express_server/tsconfig.json .

RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY express_server/data/ ./data


# 1. Set the internal default for the Node app
ENV PORT=9000

# 2. Document the port for Traefik/Docker
EXPOSE 9000

CMD ["node", "dist/server.js"]
