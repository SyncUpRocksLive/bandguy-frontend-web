# Stage 1: Build
FROM node:20.11.1 AS builder

# Create a symlink so 'python' points to 'python3'
RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Copy from the root context
COPY package*.json ./
# 'npm ci' is faster/cleaner for Docker builds than 'npm install' (do not need server side builds)
RUN npm ci --ignore-scripts 

# Copy the source code from the root
COPY src/ ./src/
COPY public/ ./public/ 
# (Add any other root folders needed for the build, like tsconfig.json)
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY LICENSE ./

RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy the config from the SUBFOLDER where it actually lives
COPY builds/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 9000
CMD ["nginx", "-g", "daemon off;"]
