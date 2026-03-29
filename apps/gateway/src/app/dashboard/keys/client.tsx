"use client";

import { useEffect, useState } from "react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export function ApiKeysClient() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    const res = await fetch("/api/keys");
    const data = await res.json();
    setKeys(data.keys);
    setLoading(false);
  }

  async function createKey() {
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName || "Untitled Key" }),
    });
    const data = await res.json();
    setCreatedKey(data.rawKey);
    setNewKeyName("");
    fetchKeys();
  }

  async function revokeKey(id: string) {
    await fetch(`/api/keys?id=${id}`, { method: "DELETE" });
    fetchKeys();
  }

  const activeKeys = keys.filter((k) => !k.revokedAt);
  const revokedKeys = keys.filter((k) => k.revokedAt);

  return (
    <div className="mt-8">
      {/* Created key banner */}
      {createdKey && (
        <div className="mb-6 rounded-[var(--radius)] border border-success/30 bg-success/5 p-4">
          <p className="text-sm font-medium text-success">
            API key created successfully
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Copy this key now. It won&apos;t be shown again.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 rounded-[var(--radius)] bg-primary px-3 py-2 font-mono text-xs text-primary-foreground">
              {createdKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdKey);
              }}
              className="rounded-[var(--radius)] border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setCreatedKey(null)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create new key */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground">
            Key name
          </label>
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g. My Claude Desktop Key"
            className="mt-1 w-full rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={createKey}
          className="shrink-0 rounded-[var(--radius)] bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
        >
          Create Key
        </button>
      </div>

      {/* Active keys */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-foreground">Active Keys</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        ) : activeKeys.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No active API keys. Create one above.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {activeKeys.map((key) => (
              <div
                key={key.id}
                className="flex flex-col gap-3 rounded-[var(--radius)] border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {key.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <code className="font-mono">{key.keyPrefix}...</code>
                    <span>
                      Created{" "}
                      {new Date(key.createdAt).toLocaleDateString()}
                    </span>
                    {key.lastUsedAt && (
                      <span>
                        Last used{" "}
                        {new Date(key.lastUsedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => revokeKey(key.id)}
                  className="rounded-[var(--radius)] border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/5"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revoked keys */}
      {revokedKeys.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-muted-foreground">
            Revoked Keys
          </h2>
          <div className="mt-3 space-y-2">
            {revokedKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-muted/30 p-4 opacity-60"
              >
                <div>
                  <p className="text-sm font-medium text-foreground line-through">
                    {key.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <code className="font-mono">{key.keyPrefix}...</code>
                    <span>Revoked</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
