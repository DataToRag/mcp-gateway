FROM node:20-slim
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY .npmrc ./

# Copy db package
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
COPY packages/db/package.json packages/db/

# Install
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/config/ packages/config/
COPY packages/types/ packages/types/
COPY packages/db/ packages/db/

CMD ["sh", "-c", "pnpm --filter @datatorag-mcp/db db:push && pnpm --filter @datatorag-mcp/db db:seed"]
