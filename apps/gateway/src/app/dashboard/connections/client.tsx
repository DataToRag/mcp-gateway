"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SERVICES } from "./services";
import type { ConnectedAccount, LegacyConnection } from "./types";

export function ConnectionsClient() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [legacyConnections, setLegacyConnections] = useState<
    LegacyConnection[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    const res = await fetch("/api/connections");
    if (res.ok) {
      const data = await res.json();
      setAccounts(data.accounts ?? []);
      setLegacyConnections(data.connections ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  async function disconnectAccount(e: React.MouseEvent, accountId: string) {
    e.preventDefault();
    e.stopPropagation();
    setDisconnecting(accountId);
    await fetch(`/api/connections?accountId=${accountId}`, {
      method: "DELETE",
    });
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    setDisconnecting(null);
  }

  async function disconnectLegacy(e: React.MouseEvent, service: string) {
    e.preventDefault();
    e.stopPropagation();
    setDisconnecting(service);
    await fetch(`/api/connections?service=${service}`, { method: "DELETE" });
    setLegacyConnections((prev) => prev.filter((c) => c.service !== service));
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
        const serviceAccounts = accounts.filter(
          (a) => a.connectorType === service.id
        );
        const legacyConn = legacyConnections.find(
          (c) => c.service === service.id
        );
        const hasAccounts = serviceAccounts.length > 0;
        const isConnected = hasAccounts || !!legacyConn;

        return (
          <div key={service.id}>
            <div
              className={`rounded-2xl border border-border p-5 ${
                isConnected
                  ? "transition-colors hover:border-primary/30"
                  : ""
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">{service.icon}</div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {service.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isConnected ? (
                    <a
                      href={service.connectUrl}
                      className="inline-block rounded-[var(--radius)] border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      Add account
                    </a>
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

              {/* Connected accounts list */}
              {hasAccounts && (
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  {serviceAccounts.map((account) => (
                    <Link
                      key={account.id}
                      href={`/dashboard/connections/${service.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {account.accountEmail[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {account.accountEmail}
                            </span>
                            {account.isDefault && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                Default
                              </span>
                            )}
                            {account.label && (
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {account.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Connected{" "}
                            {new Date(account.connectedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => disconnectAccount(e, account.id)}
                        disabled={disconnecting === account.id}
                        className="rounded-[var(--radius)] border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                      >
                        {disconnecting === account.id
                          ? "..."
                          : "Disconnect"}
                      </button>
                    </Link>
                  ))}
                </div>
              )}

              {/* Legacy connection (no connected_accounts row yet) */}
              {!hasAccounts && legacyConn && (
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    Connected{" "}
                    {new Date(legacyConn.connectedAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </p>
                  <button
                    onClick={(e) => disconnectLegacy(e, service.id)}
                    disabled={disconnecting === service.id}
                    className="rounded-[var(--radius)] border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                  >
                    {disconnecting === service.id
                      ? "..."
                      : "Disconnect"}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
