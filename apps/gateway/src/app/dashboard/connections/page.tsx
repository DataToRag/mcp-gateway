import { ConnectionsClient } from "./client";

export default function ConnectionsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary">
        Connections
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Connect your accounts so AI assistants can access your data through
        the MCP gateway.
      </p>

      <ConnectionsClient />
    </div>
  );
}
