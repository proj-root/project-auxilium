CREATE TABLE "forum_comment" (
	"comment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() UNIQUE,
	"post_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"text" text NOT NULL,
	"created_by" uuid NOT NULL,
	"status_id" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_post" (
	"post_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() UNIQUE,
	"title" varchar(150) NOT NULL,
	"content" text NOT NULL,
	"created_by" uuid NOT NULL,
	"status_id" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "forum_comment_postId_idx" ON "forum_comment" ("post_id");--> statement-breakpoint
CREATE INDEX "forum_comment_parentCommentId_idx" ON "forum_comment" ("parent_comment_id");--> statement-breakpoint
ALTER TABLE "forum_comment" ADD CONSTRAINT "forum_comment_post_id_forum_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_post"("post_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "forum_comment" ADD CONSTRAINT "forum_comment_parent_comment_id_forum_comment_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "forum_comment"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "forum_comment" ADD CONSTRAINT "forum_comment_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "forum_comment" ADD CONSTRAINT "forum_comment_status_id_status_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "forum_post" ADD CONSTRAINT "forum_post_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "forum_post" ADD CONSTRAINT "forum_post_status_id_status_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE CASCADE ON UPDATE CASCADE;