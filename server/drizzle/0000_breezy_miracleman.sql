CREATE TYPE "public"."event_role" AS ENUM('ORGANIZER', 'HELPER', 'PARTICIPANT');--> statement-breakpoint
CREATE TABLE "course" (
	"code" varchar(10) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"event_type_id" integer,
	"description" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"platform" varchar(20),
	"signupUrl" varchar(255),
	"feedbackUrl" varchar(255),
	"helpersUrl" varchar(255),
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_participation" (
	"participation_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"attended" boolean DEFAULT false,
	"event_role" "event_role" DEFAULT 'PARTICIPANT',
	"points_awarded" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_report" (
	"event_report_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"signup_count" integer,
	"feedback_count" integer,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_type" (
	"event_type_id" integer PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "event_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role" (
	"role_id" integer PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "status" (
	"status_id" integer PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "status_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(100) NOT NULL,
	"status_id" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"profile_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"course" varchar(10),
	"ichat" varchar(100) NOT NULL,
	"admin_number" varchar(7) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profile_ichat_unique" UNIQUE("ichat"),
	CONSTRAINT "user_profile_admin_number_unique" UNIQUE("admin_number")
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"user_id" uuid NOT NULL,
	"role_id" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_role_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_event_type_id_event_type_event_type_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_type"("event_type_id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_created_by_user_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("user_id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_participation" ADD CONSTRAINT "event_participation_profile_id_user_profile_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profile"("profile_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_participation" ADD CONSTRAINT "event_participation_event_id_event_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("event_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_report" ADD CONSTRAINT "event_report_event_id_event_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("event_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_report" ADD CONSTRAINT "event_report_created_by_user_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("user_id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_profile_id_user_profile_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profile"("profile_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_status_id_status_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."status"("status_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_course_course_code_fk" FOREIGN KEY ("course") REFERENCES "public"."course"("code") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_role_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("role_id") ON DELETE cascade ON UPDATE cascade;