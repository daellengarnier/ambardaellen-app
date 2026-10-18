import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  char,
  date,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default("Ambar & Dällen"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  userId: char("user_id", { length: 1 }).notNull(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Aggregat: alle Workspace-Daten als JSONB. Für 2 Nutzer reicht das
// völlig — Sync = ein GET + ein PUT, Version verhindert Lost-Writes.
export const workspaceState = pgTable("workspace_state", {
  workspaceId: uuid("workspace_id")
    .primaryKey()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull().default({}),
  version: integer("version").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Account = typeof accounts.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type WorkspaceState = typeof workspaceState.$inferSelect;

// ─── Life-App ───────────────────────────────────────────────
// Ab dem Umbau zur Ein-Personen-App leben Todos, Inbox und Tagesplan
// in eigenen Tabellen. So kann Jarvis über die API einzelne Einträge
// ändern, ohne mit dem Client um den JSON-Block zu konkurrieren.

// Die 13 Bereiche aus Jarvis. Geseedet in der Migration 0002.
export const areas = pgTable("areas", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  world: text("world").notNull(), // "spinnerei" | "privat"
  sort: integer("sort").notNull().default(0),
});

export const todos = pgTable(
  "todos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    text: text("text").notNull(),
    note: text("note").notNull().default(""),
    areaKey: text("area_key").references(() => areas.key, { onDelete: "set null" }),
    due: date("due", { mode: "string" }),
    prio: text("prio").notNull().default("normal"), // "hoch" | "normal" | "tief"
    status: text("status").notNull().default("offen"), // "offen" | "erledigt" | "verworfen"
    plannedFor: date("planned_for", { mode: "string" }),
    doneAt: timestamp("done_at", { withTimezone: true }),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    source: text("source").notNull().default("app"), // app | jarvis | telegram | inbox | migration | orga-app
    sourceRef: text("source_ref"),
    createdBy: text("created_by").notNull().default("alain"), // "alain" | "jarvis"
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("todos_status_idx").on(t.status),
    index("todos_planned_for_idx").on(t.plannedFor),
    index("todos_due_idx").on(t.due),
  ],
);

export const inboxItems = pgTable(
  "inbox_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    text: text("text").notNull(),
    source: text("source").notNull().default("app"), // app | telegram | jarvis
    createdBy: text("created_by").notNull().default("alain"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    todoId: uuid("todo_id").references(() => todos.id, { onDelete: "set null" }),
  },
  (t) => [index("inbox_items_processed_at_idx").on(t.processedAt)],
);

export const dayPlans = pgTable("day_plans", {
  date: date("date", { mode: "string" }).primaryKey(),
  note: text("note").notNull().default(""),
  updatedBy: text("updated_by").notNull().default("jarvis"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// API-Tokens für Jarvis. Gespeichert wird nur der SHA-256-Hash.
export const apiTokens = pgTable("api_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

// Unveränderte Kopie des JSON-Blocks vor dem Umbau (inkl. Daten von
// Ambar). Wird von der App nie gelesen. Löschen erst nach Freigabe.
export const legacyWorkspaceState = pgTable("legacy_workspace_state", {
  workspaceId: uuid("workspace_id").primaryKey(),
  data: jsonb("data").notNull(),
  version: integer("version").notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Area = typeof areas.$inferSelect;
export type TodoRow = typeof todos.$inferSelect;
export type InboxRow = typeof inboxItems.$inferSelect;
export type DayPlanRow = typeof dayPlans.$inferSelect;
export type ApiToken = typeof apiTokens.$inferSelect;
