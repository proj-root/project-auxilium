ALTER TABLE "event" RENAME COLUMN "signupUrl" TO "signup_url";--> statement-breakpoint
ALTER TABLE "event" RENAME COLUMN "feedbackUrl" TO "feedback_url";--> statement-breakpoint
ALTER TABLE "event" RENAME COLUMN "helpersUrl" TO "helpers_url";--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_event_id_unique" UNIQUE("event_id");