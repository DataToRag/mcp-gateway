import { z } from "zod";

export const ApiKeyPrefix = "sk-dtrmcp_";

export const mcpServerStatusSchema = z.enum([
  "pending",
  "building",
  "active",
  "error",
  "disabled",
]);
export type McpServerStatus = z.infer<typeof mcpServerStatusSchema>;

export const creditTransactionTypeSchema = z.enum([
  "purchase",
  "usage",
  "refund",
  "bonus",
  "adjustment",
]);
export type CreditTransactionType = z.infer<typeof creditTransactionTypeSchema>;

export interface ApiKeyValidationResult {
  valid: boolean;
  userId?: string;
  apiKeyId?: string;
}

export interface McpGatewayManifest {
  name: string;
  description?: string;
  version?: string;
  icon?: string;
  categories?: string[];
  author?: {
    name: string;
    url?: string;
  };
  server: {
    transport: "streamable-http";
    port: number;
    path: string;
    healthCheckPath?: string;
    buildCommand?: string;
    startCommand?: string;
  };
  pricing?: {
    creditsPerCall: Record<string, number>;
  };
  env?: {
    required?: string[];
    optional?: string[];
  };
  oauth?: {
    provider: string;
    authorizeUrl: string;
    tokenUrl: string;
    clientIdEnv: string;
    clientSecretEnv: string;
    scopes: string[];
  };
  dockerfile?: string;
}
