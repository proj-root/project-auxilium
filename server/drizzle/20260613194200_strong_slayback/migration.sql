CREATE TABLE "user_event_role" (
	"user_event_role_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event_role_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_event_role" ADD CONSTRAINT "user_event_role_event_id_event_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "user_event_role" ADD CONSTRAINT "user_event_role_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "user_event_role" ADD CONSTRAINT "user_event_role_event_role_id_event_role_event_role_id_fkey" FOREIGN KEY ("event_role_id") REFERENCES "event_role"("event_role_id") ON DELETE SET NULL ON UPDATE CASCADE;