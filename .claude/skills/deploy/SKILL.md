---
name: deploy
description: Use when deploying the DataToRAG MCP gateway to production. Handles SSH into the server, git pull, Docker rebuild, health check, and optional plugin reinstall.
user_invocable: true
---

# Deploy DataToRAG MCP Gateway

## Prerequisites

- AWS CLI configured with a profile that has Lightsail access
- The production instance runs Docker Compose on AWS Lightsail

## Steps

1. **Resolve SSH access**
   - Use `aws lightsail get-instances` to find the instance IP
   - Use `aws lightsail download-default-key-pair` to get the SSH key if needed
   - Save to a temp file with `chmod 600`, connect as `ubuntu@<instance-ip>`
   - If AWS CLI has SSL issues, set `AWS_CA_BUNDLE=""` as a workaround

2. **Pull latest code on the server**
   ```bash
   ssh -i <key> ubuntu@<ip> "cd ~/datatorag-mcp && git pull origin main"
   ```

3. **Rebuild and restart the gateway**
   ```bash
   ssh -i <key> ubuntu@<ip> "cd ~/datatorag-mcp/docker && docker compose --env-file ../.env -f docker-compose.prod.yml up -d --build gateway"
   ```
   - The `.env` file lives at `~/datatorag-mcp/.env` on the server (NOT in `docker/`)
   - Must pass `--env-file ../.env` to docker compose
   - This rebuilds only the gateway container; postgres data is preserved in a volume

4. **Health check**
   ```bash
   curl -s https://datatorag.com/health
   ```
   Wait for `{"status":"ok"}` before proceeding.

5. **Reinstall plugins if needed**
   The public POST/DELETE endpoints on `/api/servers` have been removed. To update a plugin:
   ```bash
   # SSH into server, then exec into the gateway container
   CONTAINER=$(docker ps --filter 'name=gateway' -q)

   # Pull latest code and rebuild inside the container
   docker exec $CONTAINER bash -c \
     'cd /root/.datatorag/plugins/<slug> && git pull origin main && NODE_ENV=development pnpm install && npx tsc'

   # Restart gateway so plugin process picks up new code
   cd ~/datatorag-mcp/docker && docker compose -f docker-compose.prod.yml --env-file ../.env restart gateway

   # If tools changed: re-discover tools by connecting to plugin MCP endpoint,
   # then update the tools table via psql. See reference_plugin_registry memory for details.
   ```
   Check status via `GET /api/servers` — verify tool count and status `active`.

6. **Clean up**
   - Remove temp SSH key files after deploy
   - Never store SSH keys or credentials permanently outside of AWS/SSH config

## Checking Logs

```bash
# Gateway container logs (last N minutes)
ssh -i <key> ubuntu@<ip> "docker logs <gateway-container> --since 30m 2>&1"

# Via compose
ssh -i <key> ubuntu@<ip> \
  "cd ~/datatorag-mcp/docker && docker compose -f docker-compose.prod.yml --env-file ../.env logs --tail 100 gateway"

# Database queries (find DB user/name from container env vars)
ssh -i <key> ubuntu@<ip> "docker exec <postgres-container> env | grep POSTGRES"
ssh -i <key> ubuntu@<ip> \
  "docker exec <postgres-container> psql -U <db-user> -d <db-name> -c '<query>'"
```

## Plugin Repos

| Slug | Repo |
|------|------|
| gws-mcp | DataToRag/gws-mcp |

## Troubleshooting

- **db-init fails**: Usually missing `POSTGRES_PASSWORD`. Ensure `--env-file ../.env` is passed.
- **Plugin build fails**: Check `buildError` field in `GET /api/servers`. Common issues: missing system deps in Dockerfile, missing binaries.
- **Gateway won't start**: Check container logs for errors.
- **GWS MCP tools load but all API calls fail**: Users must separately connect their Google Workspace account via the DataToRAG web UI. The gateway stores per-user Google OAuth tokens in the `service_connections` table and forwards them to the GWS plugin via `X-User-Token` header. If no row exists for the user, or the token is expired and refresh fails, all tool calls return generic "Error occurred during tool execution" with no detail. Check the `service_connections` table for `token_expires_at` and `updated_at` to diagnose.
- **GWS binary not found (ENOENT)**: The Dockerfile needs `curl unzip` in apt-get install, and the gws-mcp `build` script must run `download-binaries.sh` before `tsc`.
