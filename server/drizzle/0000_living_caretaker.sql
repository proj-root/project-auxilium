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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"profile_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"gender" varchar(20),
	"dob" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
ALTER TABLE "user" ADD CONSTRAINT "user_profile_id_user_profile_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profile"("profile_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_role_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("role_id") ON DELETE cascade ON UPDATE cascade;