# Stage 1: Build
FROM node:20.11.1-alpine AS builder
WORKDIR /app
COPY express_server/package*.json ./
RUN npm ci
COPY express_server/data/ ./data
COPY express_server/*.ts .
COPY express_server/tsconfig.json .

RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist 
# ^ Or wherever your compiled JS/TS lives
EXPOSE 9001
CMD ["node", "dist/server.js"]
