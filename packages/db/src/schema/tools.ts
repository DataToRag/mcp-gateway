import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { mcpServers } from "./mcp-servers";

export const tools = pgTable("tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  mcpServerId: uuid("mcp_server_id")
    .notNull()
    .references(() => mcpServers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  namespacedName: text("namespaced_name").notNull().unique(),
  description: text("description"),
  inputSchemaJson: jsonb("input_schema_json"),
  creditsPerCall: integer("credits_per_call").notNull().default(1),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
