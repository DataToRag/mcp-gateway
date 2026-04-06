const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_URL = "https://us.i.posthog.com/capture/";

/**
 * Fire a PostHog event. Non-blocking — errors are silently swallowed.
 */
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
  if (!POSTHOG_API_KEY) return;

  fetch(POSTHOG_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: POSTHOG_API_KEY,
      event: "tool_call",
      properties: {
        distinct_id: props.userId,
        tool_name: props.toolName,
        connector_type: props.connectorType,
        account_email: props.accountEmail ?? null,
        status: props.status,
        latency_ms: props.latencyMs,
        response_size_bytes: props.responseSizeBytes,
        error_message: props.errorMessage,
      },
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {});
}
