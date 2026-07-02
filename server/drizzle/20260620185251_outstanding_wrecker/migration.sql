CREATE TYPE "task_priority" AS ENUM('High', 'Medium', 'Low');--> statement-breakpoint
CREATE TYPE "task_status" AS ENUM('Not started', 'In progress', 'Completed');--> statement-breakpoint
CREATE TABLE "task" (
	"task_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() UNIQUE,
	"event_id" uuid NOT NULL,
	"assignee_id" uuid,
	"title" varchar(100) NOT NULL,
	"description" varchar(250),
	"status" "task_status" DEFAULT 'Not started'::"task_status" NOT NULL,
	"priority" "task_priority" DEFAULT 'High'::"task_priority" NOT NULL,
	"department_id" integer,
	"deadline" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_comment" (
	"task_comment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() UNIQUE,
	"task_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_event_id_event_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_assignee_id_user_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_department_id_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "task_comment" ADD CONSTRAINT "task_comment_task_id_task_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "task_comment" ADD CONSTRAINT "task_comment_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;