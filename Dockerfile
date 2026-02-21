# Stage 1: Build the frontend and prepare the backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency resolution
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN npm install --prefix client
RUN npm install --prefix server

# Copy source code
COPY client/ ./client/
COPY server/ ./server/

# Build the client
RUN npm run build --prefix client

# Stage 2: Final production image
FROM node:20-alpine

WORKDIR /app

# Copy build artifacts and server source from Stage 1
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/package.json ./package.json

# Standard Cloud Run port
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Start the server
CMD ["npm", "run", "start", "--prefix", "server"]
