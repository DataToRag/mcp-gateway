"use client";

import { useState, useEffect, useCallback } from "react";

interface Connection {
  id: string;
  service: string;
  scopes: string | null;
  connectedAt: string;
}

const SERVICES = [
  {
    id: "google-workspace",
    name: "Google Workspace",
    description:
      "Gmail, Drive, Calendar, Docs, Sheets, Slides, Contacts, and Tasks",
    connectUrl: "/auth/google/connect",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
];

export function ConnectionsClient() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    const res = await fetch("/api/connections");
    if (res.ok) {
      const data = await res.json();
      setConnections(data.connections);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  async function disconnect(service: string) {
    setDisconnecting(service);
    await fetch(`/api/connections?service=${service}`, { method: "DELETE" });
    setConnections((prev) => prev.filter((c) => c.service !== service));
    setDisconnecting(null);
  }

  if (loading) {
    return (
      <div className="mt-8 text-sm text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {SERVICES.map((service) => {
        const connection = connections.find(
          (c) => c.service === service.id
        );
        const isConnected = !!connection;

        return (
          <div
            key={service.id}
            className="flex flex-col gap-4 rounded-2xl border border-border p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0">{service.icon}</div>
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  {service.name}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {service.description}
                </p>
                {isConnected && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Connected{" "}
                    {new Date(connection.connectedAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {isConnected ? (
                <button
                  onClick={() => disconnect(service.id)}
                  disabled={disconnecting === service.id}
                  className="rounded-[var(--radius)] border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                >
                  {disconnecting === service.id
                    ? "Disconnecting..."
                    : "Disconnect"}
                </button>
              ) : (
                <a
                  href={service.connectUrl}
                  className="inline-block rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Connect
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
