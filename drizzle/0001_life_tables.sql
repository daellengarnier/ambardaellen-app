CREATE TABLE "api_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "api_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "areas" (
	"key" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"world" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_plans" (
	"date" date PRIMARY KEY NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"updated_by" text DEFAULT 'jarvis' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbox_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"source" text DEFAULT 'app' NOT NULL,
	"created_by" text DEFAULT 'alain' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"todo_id" uuid
);
--> statement-breakpoint
CREATE TABLE "legacy_workspace_state" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"version" integer NOT NULL,
	"archived_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"area_key" text,
	"due" date,
	"prio" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'offen' NOT NULL,
	"planned_for" date,
	"done_at" timestamp with time zone,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"source" text DEFAULT 'app' NOT NULL,
	"source_ref" text,
	"created_by" text DEFAULT 'alain' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inbox_items" ADD CONSTRAINT "inbox_items_todo_id_todos_id_fk" FOREIGN KEY ("todo_id") REFERENCES "public"."todos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_area_key_areas_key_fk" FOREIGN KEY ("area_key") REFERENCES "public"."areas"("key") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inbox_items_processed_at_idx" ON "inbox_items" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "todos_status_idx" ON "todos" USING btree ("status");--> statement-breakpoint
CREATE INDEX "todos_planned_for_idx" ON "todos" USING btree ("planned_for");--> statement-breakpoint
CREATE INDEX "todos_due_idx" ON "todos" USING btree ("due");