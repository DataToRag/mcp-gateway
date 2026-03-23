FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY .npmrc ./

# Copy package manifests
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
COPY packages/db/package.json packages/db/
COPY packages/auth/package.json packages/auth/
COPY apps/gateway/package.json apps/gateway/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/config/ packages/config/
COPY packages/types/ packages/types/
COPY packages/db/ packages/db/
COPY packages/auth/ packages/auth/
COPY apps/gateway/ apps/gateway/

# Build workspace packages, then Next.js + custom server
ENV DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder
RUN pnpm run build --filter=@datatorag-mcp/gateway

WORKDIR /app/apps/gateway
EXPOSE 8285
CMD ["node", "dist/server.js"]
