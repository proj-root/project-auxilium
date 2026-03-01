ALTER TABLE "event_participation" DROP CONSTRAINT "event_participation_event_id_event_event_id_fk";
--> statement-breakpoint
ALTER TABLE "event_participation" ADD COLUMN "event_report_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "event_participation" ADD CONSTRAINT "event_participation_event_report_id_event_report_event_report_id_fk" FOREIGN KEY ("event_report_id") REFERENCES "public"."event_report"("event_report_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_participation" DROP COLUMN "event_id";