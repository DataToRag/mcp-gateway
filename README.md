# DataToRAG MCP

An open-source MCP gateway and marketplace. Connect any MCP client with a single API key to access a marketplace of open-source MCP tools.

## Architecture

```
            ┌──────────────────┐
            │    MCP Client    │
            │  Claude Desktop, │
            │   Cursor, etc.   │
            └────────┬─────────┘
                     │
           POST /mcp │  Bearer sk-dtrmcp_...
                     │
                     ▼
            ┌──────────────────┐
            │    1. Auth       │── SHA-256 hash
            │                  │   LRU cache
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
                     │              │ api_keys   │
                     ▼              │ credits    │
            ┌──────────────────┐    │ logs       │
            │  4. Route by     │<──>│            │
            │     namespace    │    └────────────┘
            └────────┬─────────┘  check credits
                     │            log + deduct
        ┌────────────┼────────────┐
        ▼            ▼            ▼
 ┌────────────┐ ┌──────────┐ ┌──────────┐
 │weather-api │ │ github-  │ │ server-n │
 │  (Docker)  │ │ tools    │ │   ...    │
 │ :3000/mcp  │ │ (Docker) │ │ (Docker) │
 └────────────┘ └──────────┘ └──────────┘
```

## Local Development

### Prerequisites

- Docker

### Quick Start

```bash
# Start everything — postgres, gateway, web, sample MCP server
docker compose -f docker/docker-compose.dev.yml up -d
```

That's it. The db-init container automatically pushes the schema and seeds a test user + API key.

| Service | URL | Description |
|---------|-----|-------------|
| **Web** | http://localhost:4200 | Marketplace frontend |
| **Gateway** | http://localhost:4100 | MCP proxy endpoint |
| **Gateway health** | http://localhost:4100/health | Health check |
| **OAuth metadata** | http://localhost:4100/.well-known/oauth-authorization-server | OAuth2 discovery |

### Connect an MCP Client

Add this to your MCP client config (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "datatorag-mcp": {
      "url": "http://localhost:4100/mcp"
    }
  }
}
```

Your browser will open automatically for sign-in via OAuth. No API key needed.

For programmatic access, create an API key at http://localhost:4200/dashboard/keys and use:

```json
{
  "mcpServers": {
    "datatorag-mcp": {
      "url": "http://localhost:4100/mcp",
      "headers": {
        "Authorization": "Bearer sk-dtrmcp_YOUR_KEY_HERE"
      }
    }
  }
}
```

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

# Start gateway (terminal 1)
DATABASE_URL=postgresql://datatoragmcp:localdev@localhost:54320/datatoragmcp \
  pnpm --filter @datatorag-mcp/gateway dev

# Start web (terminal 2)
DATABASE_URL=postgresql://datatoragmcp:localdev@localhost:54320/datatoragmcp \
  pnpm --filter web dev
```

## Project Structure

```
apps/
  gateway/            # MCP proxy server (Express + MCP SDK)
  web/                # Next.js marketplace frontend
packages/
  auth/               # API key generation & validation
  config/             # Environment variable parsing
  db/                 # Drizzle ORM schema & database client
  docker-manager/     # Docker container lifecycle management
  types/              # Shared TypeScript types
samples/
  math-tools/         # Sample MCP server for testing
docker/
  docker-compose.dev.yml   # Full local dev stack
```

## License

MIT
