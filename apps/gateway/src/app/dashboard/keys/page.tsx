import { ApiKeysClient } from "./client";

export default function ApiKeysPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary">
        API Keys
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create and manage API keys for programmatic access. Keys are an
        alternative to OAuth — use them in scripts and CI pipelines.
      </p>

      <ApiKeysClient />
    </div>
  );
}
