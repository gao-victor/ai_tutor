# Multi-stage build for AI Tutor application

# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY vite.config.js ./
COPY index.html ./
COPY eslint.config.js ./

# Install ALL dependencies (including dev dependencies needed for build)
# Fix for Rollup optional dependencies issue in Alpine Linux
RUN rm -rf package-lock.json node_modules && npm install

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/

# Build the frontend
RUN npm run build

# Stage 2: Build the Node.js server
FROM node:20-alpine AS server-builder

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install server dependencies
RUN npm ci --only=production

# Copy server source code
COPY server/src/ ./src/

# Stage 3: Production image
FROM node:20-alpine AS production

# Create app directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy server dependencies from builder stage
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/src ./src
COPY --from=server-builder /app/package*.json ./

# Copy built frontend files from frontend-builder stage
COPY --from=frontend-builder /app/dist ./public

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port (Cloud Run will set PORT env var)
EXPOSE $PORT

# Health check (use PORT env var)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5001) + '/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server directly
CMD ["node", "src/index.mjs"]