# DataToRAG MCP

An open-source MCP gateway. Connect any MCP client to access Google Workspace and other MCP tools through a single endpoint.

## Architecture

```
            ┌──────────────────┐
            │    MCP Client    │
            │  Claude Desktop, │
            │   Cursor, etc.   │
            └────────┬─────────┘
                     │
           POST /mcp │  Bearer <OAuth token>
                     │
                     ▼
            ┌──────────────────┐
            │    1. Auth       │── OAuth2 token
            │                  │   validation
            └────────┬─────────┘   401 if invalid
                     │
                     ▼
            ┌──────────────────┐
            │   2. Session     │── Streamable HTTP
            │                  │   Create or reuse
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐    ┌────────────┐
            │  3. tools/list   │───>│ PostgreSQL │
            │     tools/call   │    │            │
            └────────┬─────────┘    │ users      │
                     │              │ tools      │
                     ▼              │ servers    │
            ┌──────────────────┐    │            │
            │  4. Route by     │<──>│            │
            │     namespace    │    └────────────┘
            └────────┬─────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
 ┌────────────┐ ┌──────────┐ ┌──────────┐
 │  gws-mcp   │ │ plugin-2 │ │ plugin-n │
 │  (Node.js) │ │   ...    │ │   ...    │
 │ :40000/mcp │ │          │ │          │
 └────────────┘ └──────────┘ └──────────┘
```

## Local Development

### Prerequisites

- Docker

### Quick Start

```bash
# Start everything — postgres, gateway
docker compose -f docker/docker-compose.dev.yml up -d
```

That's it. The db-init container automatically pushes the schema and seeds a test user.

| Service | URL | Description |
|---------|-----|-------------|
| **Gateway** | http://localhost:4100 | MCP proxy + dashboard |
| **Gateway health** | http://localhost:4100/health | Health check |
| **OAuth metadata** | http://localhost:4100/.well-known/oauth-authorization-server | OAuth2 discovery |

### Connect an MCP Client

Add this to your MCP client config (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "datatorag": {
      "url": "http://localhost:4100/mcp"
    }
  }
}
```

Your browser will open automatically for sign-in via OAuth.

### Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DATABASE_URL` | — | Yes | PostgreSQL connection string |
| `GATEWAY_PORT` | `4100` | No | Gateway server port |
| `GATEWAY_BASE_URL` | `http://localhost:4100` | No | Public URL for OAuth redirects |
| `GOOGLE_CLIENT_ID` | — | For OAuth | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | — | For OAuth | Google OAuth client secret |

### Development Without Docker

If you prefer running services directly:

```bash
# Start only PostgreSQL
docker compose -f docker/docker-compose.dev.yml up postgres -d

# Install dependencies
pnpm install

# Push schema + seed
DATABASE_URL=postgresql://datatoragmcp:localdev@localhost:54320/datatoragmcp \
  pnpm --filter @datatorag-mcp/db db:push && \
  pnpm --filter @datatorag-mcp/db db:seed

# Start gateway
DATABASE_URL=postgresql://datatoragmcp:localdev@localhost:54320/datatoragmcp \
  pnpm --filter @datatorag-mcp/gateway dev
```

## Project Structure

```
apps/
  gateway/            # MCP proxy server (Express + MCP SDK) + dashboard
packages/
  config/             # Environment variable parsing
  db/                 # Drizzle ORM schema & database client
  types/              # Shared TypeScript types
docker/
  docker-compose.dev.yml   # Full local dev stack
  docker-compose.prod.yml  # Production (Lightsail)
```

## License

MIT
