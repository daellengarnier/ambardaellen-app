CREATE TABLE "card_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"direction" text NOT NULL,
	"rating" integer NOT NULL,
	"interval_before" integer NOT NULL,
	"interval_after" integer NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_states" (
	"card_id" uuid NOT NULL,
	"direction" text NOT NULL,
	"due" date,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"ease" real DEFAULT 2.5 NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"introduced_on" date,
	"last_reviewed_at" timestamp with time zone,
	CONSTRAINT "card_states_card_id_direction_pk" PRIMARY KEY("card_id","direction")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deck_id" text NOT NULL,
	"type" text NOT NULL,
	"front" text NOT NULL,
	"back_de" text DEFAULT '' NOT NULL,
	"back_en" text DEFAULT '' NOT NULL,
	"back_vi" text DEFAULT '' NOT NULL,
	"pos" text DEFAULT '' NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"example_vi" text DEFAULT '' NOT NULL,
	"example_de" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"course" text DEFAULT '' NOT NULL,
	"level" text DEFAULT '' NOT NULL,
	"topic" text DEFAULT '' NOT NULL,
	"source" text DEFAULT '' NOT NULL,
	"language" text DEFAULT 'vi' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card_reviews" ADD CONSTRAINT "card_reviews_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_states" ADD CONSTRAINT "card_states_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_reviews_reviewed_at_idx" ON "card_reviews" USING btree ("reviewed_at");--> statement-breakpoint
CREATE INDEX "card_states_due_idx" ON "card_states" USING btree ("due");--> statement-breakpoint
CREATE UNIQUE INDEX "cards_deck_type_front_idx" ON "cards" USING btree ("deck_id","type","front");