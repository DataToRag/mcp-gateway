"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SERVICES } from "./services";

interface Connection {
  id: string;
  service: string;
  scopes: string | null;
  connectedAt: string;
}

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

  async function disconnect(e: React.MouseEvent, service: string) {
    e.preventDefault();
    e.stopPropagation();
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

        const card = (
          <div
            className={`flex flex-col gap-4 rounded-2xl border border-border p-5 sm:flex-row sm:items-center sm:justify-between ${
              isConnected
                ? "transition-colors hover:border-primary/30 hover:bg-secondary/50"
                : ""
            }`}
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
                  onClick={(e) => disconnect(e, service.id)}
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

        if (isConnected) {
          return (
            <Link
              key={service.id}
              href={`/dashboard/connections/${service.id}`}
              className="block"
            >
              {card}
            </Link>
          );
        }

        return <div key={service.id}>{card}</div>;
      })}
    </div>
  );
}
