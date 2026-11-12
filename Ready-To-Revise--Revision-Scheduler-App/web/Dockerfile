FROM node:22-alpine AS builder

# Install dependencies
WORKDIR /app

# Install build tools for native deps (tailwind, etc.)
RUN apk add --no-cache python3 make g++ 

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup

# Set correct permissions
RUN chown -R nodeuser:nodegroup /app

# Copy built output from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tailwind.config.* ./
COPY --from=builder /app/.env.production ./.env.production

# Set to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Start the app
ENV NODE_ENV=production
CMD ["npm", "start"]