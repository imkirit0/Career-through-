CREATE TABLE "arena_round" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" text NOT NULL,
	"subject" text NOT NULL,
	"question_ids" jsonb NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"answers" jsonb,
	"correct" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"score" jsonb,
	"scoring_version" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "leaderboard_hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "arena_board_idx" ON "arena_round" USING btree ("role_id","finished_at");--> statement-breakpoint
CREATE INDEX "arena_user_idx" ON "arena_round" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "arena_one_open_round" ON "arena_round" USING btree ("user_id") WHERE "arena_round"."finished_at" is null;--> statement-breakpoint
-- Same rule as every other table: server-side access only.
ALTER TABLE "arena_round" ENABLE ROW LEVEL SECURITY;
