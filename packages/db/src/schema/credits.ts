import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const creditBalances = pgTable("credit_balances", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
