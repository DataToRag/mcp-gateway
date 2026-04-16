import { PostHog } from "posthog-node";

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_HOST = "https://us.i.posthog.com";

let client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!POSTHOG_API_KEY) return null;
  if (!client) {
    client = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      flushAt: 20,
      flushInterval: 10_000,
    });
  }
  return client;
}

/** Flush pending events. Call on graceful shutdown. */
export async function shutdownPosthog(): Promise<void> {
  if (client) {
    await client.shutdown();
    client = null;
  }
}

export function trackToolCall(props: {
  userId: string;
  toolName: string;
  connectorType: string | null;
  accountEmail: string | undefined;
  status: "success" | "error";
  latencyMs: number;
  responseSizeBytes: number | null;
  errorMessage: string | null;
}): void {
  const c = getClient();
  if (!c) return;
  c.capture({
    distinctId: props.userId,
    event: "tool_call",
    properties: {
      tool_name: props.toolName,
      connector_type: props.connectorType,
      account_email: props.accountEmail ?? null,
      status: props.status,
      latency_ms: props.latencyMs,
      response_size_bytes: props.responseSizeBytes,
      error_message: props.errorMessage,
    },
  });
}

export function trackSignup(userId: string, email: string, name: string | null): void {
  const c = getClient();
  if (!c) return;
  c.identify({
    distinctId: userId,
    properties: { email, name: name ?? undefined },
  });
  c.capture({
    distinctId: userId,
    event: "user_signed_up",
    properties: { email },
  });
}

export function trackLogin(userId: string): void {
  const c = getClient();
  if (!c) return;
  c.capture({
    distinctId: userId,
    event: "user_logged_in",
  });
}

export function trackConnectorAdded(userId: string, connector: string): void {
  const c = getClient();
  if (!c) return;
  c.capture({
    distinctId: userId,
    event: "connector_added",
    properties: { connector },
  });
}

export function trackOAuthCompleted(
  userId: string,
  provider: string,
  accountEmail: string
): void {
  const c = getClient();
  if (!c) return;
  c.capture({
    distinctId: userId,
    event: "account_connected",
    properties: { provider, account_email: accountEmail },
  });
}
