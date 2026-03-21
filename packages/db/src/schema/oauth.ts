import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

// Dynamic client registration (RFC 7591)
export const oauthClients = pgTable("oauth_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret"),
  redirectUris: jsonb("redirect_uris").notNull().$type<string[]>(),
  clientName: text("client_name"),
  grantTypes: jsonb("grant_types").notNull().$type<string[]>(),
  responseTypes: jsonb("response_types").notNull().$type<string[]>(),
  tokenEndpointAuthMethod: text("token_endpoint_auth_method")
    .notNull()
    .default("none"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Authorization codes (short-lived, exchanged for tokens)
export const oauthAuthorizationCodes = pgTable("oauth_authorization_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  clientId: text("client_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  redirectUri: text("redirect_uri").notNull(),
  codeChallenge: text("code_challenge").notNull(),
  codeChallengeMethod: text("code_challenge_method").notNull().default("S256"),
  scope: text("scope"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Access tokens
export const oauthAccessTokens = pgTable("oauth_access_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  clientId: text("client_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scope: text("scope"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
