ALTER TABLE "event_type" ADD CONSTRAINT "event_type_event_type_id_unique" UNIQUE("event_type_id");--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_role_id_unique" UNIQUE("role_id");--> statement-breakpoint
ALTER TABLE "status" ADD CONSTRAINT "status_status_id_unique" UNIQUE("status_id");