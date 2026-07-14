CREATE TABLE "department" (
	"department_id" integer PRIMARY KEY UNIQUE,
	"name" varchar(50) NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_department" (
	"user_id" uuid,
	"department_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_department_pkey" PRIMARY KEY("user_id","department_id")
);
--> statement-breakpoint
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_department_id_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE CASCADE ON UPDATE CASCADE;