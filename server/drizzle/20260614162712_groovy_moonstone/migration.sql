ALTER TABLE "user_event_role" DROP COLUMN "user_event_role_id";--> statement-breakpoint
ALTER TABLE "user_event_role" ADD PRIMARY KEY ("event_id","user_id");