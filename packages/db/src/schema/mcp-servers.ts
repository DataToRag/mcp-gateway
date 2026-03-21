import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const mcpServers = pgTable("mcp_servers", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  githubRepoUrl: text("github_repo_url"),
  githubRepoOwner: text("github_repo_owner"),
  githubRepoName: text("github_repo_name"),
  licenseSpdx: text("license_spdx"),
  lastCommitSha: text("last_commit_sha"),
  dockerImageTag: text("docker_image_tag"),
  containerPort: integer("container_port").notNull().default(3000),
  status: text("status", {
    enum: ["pending", "building", "active", "error", "disabled"],
  })
    .notNull()
    .default("pending"),
  buildError: text("build_error"),
  submittedByUserId: uuid("submitted_by_user_id").references(() => users.id),
  manifestJson: jsonb("manifest_json"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
