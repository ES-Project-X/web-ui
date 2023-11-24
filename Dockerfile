FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the app
RUN npm run build

# Production image, copy necessary files
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Fixed environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Build arguments environment variables
ENV COGNITO_LOGIN_URL=$COGNITO_LOGIN_URL
ENV DATABASE_API_URL=$DATABASE_API_URL
ENV PUBLIC_KEY_HERE=$PUBLIC_KEY_HERE
ENV URL_ROUTING=$URL_ROUTING

# Copy necessary files from builder stage
COPY --from=builder /app/public ./public
RUN mkdir .next && chown root:root .next
COPY --from=builder --chown=root:root --chmod=644 /app/.next/standalone ./
COPY --from=builder --chown=root:root --chmod=644 /app/.next/static ./.next/static

EXPOSE $PORT

CMD ["node", "server.js"]
