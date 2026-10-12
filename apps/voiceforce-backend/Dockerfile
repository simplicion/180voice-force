# Multi-stage Dockerfile for Voice Force Dedicated Backend & BullMQ Worker
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Step 1: Dependencies
FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/voiceforce-backend/package.json ./apps/voiceforce-backend/
COPY packages/db-voiceforce/package.json ./packages/db-voiceforce/
COPY packages/domains/voiceforce/package.json ./packages/domains/voiceforce/
COPY packages/domains/wallet/package.json ./packages/domains/wallet/
COPY packages/backend-infra/package.json ./packages/backend-infra/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/identity-sdk/package.json ./packages/identity-sdk/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

# Step 2: Build
FROM dependencies AS build
COPY . .
RUN pnpm run db:generate
RUN pnpm turbo run build --filter=@workspace/voiceforce-backend...

# Step 3: Production Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4005

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/voiceforce-backend ./apps/voiceforce-backend
COPY --from=build /app/package.json ./package.json

EXPOSE 4005

CMD ["node", "apps/voiceforce-backend/dist/server.js"]
