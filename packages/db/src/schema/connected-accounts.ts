import {
  boolean,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { serviceConnections } from "./service-connections";

export const connectedAccounts = pgTable(
  "connected_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    connectorType: text("connector_type").notNull(), // "google-workspace", "atlassian"
    label: text("label"), // display label: "work", "personal"
    accountEmail: text("account_email").notNull(), // routing key
    serviceConnectionId: uuid("service_connection_id")
      .notNull()
      .references(() => serviceConnections.id, { onDelete: "cascade" }),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_user_connector_email").on(
      table.userId,
      table.connectorType,
      table.accountEmail
    ),
  ]
);
