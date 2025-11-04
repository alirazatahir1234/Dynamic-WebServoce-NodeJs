# Production stage
FROM node:20-slim

WORKDIR /app

# Install required system dependencies for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev - needed for Prisma to generate client)
RUN npm ci

# Copy source code and prisma schema
COPY src ./src
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Generate Prisma client
RUN npm run prisma:generate

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start application
CMD ["node", "dist/src/main"]
