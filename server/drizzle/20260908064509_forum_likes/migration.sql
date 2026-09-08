CREATE TABLE "forum_comment_like" (
	"comment_id" uuid,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forum_comment_like_pkey" PRIMARY KEY("comment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "forum_post_like" (
	"post_id" uuid,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forum_post_like_pkey" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "forum_comment_like" ADD CONSTRAINT "forum_comment_like_comment_id_forum_comment_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "forum_comment"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "forum_comment_like" ADD CONSTRAINT "forum_comment_like_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "forum_post_like" ADD CONSTRAINT "forum_post_like_post_id_forum_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_post"("post_id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "forum_post_like" ADD CONSTRAINT "forum_post_like_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;