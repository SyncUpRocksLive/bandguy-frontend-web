# Stage 1: Build
FROM node:24-slim AS builder

# Add essential build tools (slim needs these for some npm installs)
RUN apt-get update && apt-get install -y python3 make g++ && ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /build

# 1. Copy root config files first
COPY package*.json ./
COPY tsconfig*.json ./

# 2. Copy the workspace app files (Important: Keep the structure!)
COPY apps/jam/package*.json ./apps/jam/
COPY apps/jam/tsconfig*.json ./apps/jam/
COPY apps/mixingroom/package*.json ./apps/mixingroom/
COPY apps/mixingroom/tsconfig*.json ./apps/mixingroom/

# 3. Install ALL dependencies (don't ignore scripts yet, we need the .bin folder)
# We use --include=dev because we need 'tsc' and 'vite' to build
RUN npm ci --include=dev

# 4. Now copy the rest of the source code
COPY public/ ./public/
COPY vite.config.ts ./
COPY index.html ./

COPY apps/jam/src/ ./apps/jam/src/
COPY apps/jam/vite.config.ts ./apps/jam/
COPY apps/jam/index.html ./apps/jam/

COPY apps/mixingroom/src/ ./apps/mixingroom/src/
COPY apps/mixingroom/vite.config.ts ./apps/mixingroom/
COPY apps/mixingroom/index.html ./apps/mixingroom/

RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy the config from the SUBFOLDER where it actually lives
COPY builds/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the builder stage
COPY --from=builder /build/public /usr/share/nginx/html

EXPOSE 9000
CMD ["nginx", "-g", "daemon off;"]
