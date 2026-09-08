import * as schema from '@/db/schema';
import type { PaginationOptions } from '@auxilium/types/pagination';
import { z } from 'zod';

export type PostDTO = typeof schema.forumPost.$inferSelect;
export type CommentDTO = typeof schema.forumComment.$inferSelect;

// A comment as returned to the client, with its replies nested underneath it.
export type CommentTreeNode = CommentDTO & {
  creator: { id: string; name: string; image: string | null } | null;
  replies: CommentTreeNode[];
};

export const CreatePostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(150, 'Title has a maximum of 150 characters'),
  content: z.string().trim().min(1, 'Content is required'),
});

export type CreatePostDTO = z.infer<typeof CreatePostSchema> & {
  createdBy: string;
};

export const UpdatePostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(150, 'Title has a maximum of 150 characters')
      .optional(),
    content: z.string().trim().min(1, 'Content cannot be empty').optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided for update',
  });

export type UpdatePostDTO = z.infer<typeof UpdatePostSchema> & {
  postId: string;
};

export const CreateCommentSchema = z.object({
  postId: z.uuid('postId must be a valid UUID'),
  parentCommentId: z.uuid('parentCommentId must be a valid UUID').optional(),
  text: z.string().trim().min(1, 'Comment cannot be empty'),
});

export type CreateCommentDTO = z.infer<typeof CreateCommentSchema> & {
  createdBy: string;
};

export const UpdateCommentSchema = z
  .object({
    text: z.string().trim().min(1, 'Comment cannot be empty').optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided for update',
  });

export type UpdateCommentDTO = z.infer<typeof UpdateCommentSchema> & {
  commentId: string;
};

// The author summary embedded in every post and comment we return.
export type CreatorDTO = {
  id: string;
  name: string;
  image: string | null;
} | null;

// A post as it appears in the feed: the row, its author, and the aggregates the
// UI needs to render like/comment counts without a second request.
export type PostListItemDTO = PostDTO & {
  creator: CreatorDTO;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

// The post page returns the same shape — comments are fetched separately, one
// thread level at a time, so they are no longer embedded here.
export type PostDetailDTO = PostListItemDTO;

// A comment as it appears in a single level of a thread. `replyCount` tells the
// client whether to offer "View replies"; the replies themselves are a further
// request keyed by this comment's id.
export type CommentListItemDTO = CommentDTO & {
  creator: CreatorDTO;
  likeCount: number;
  likedByMe: boolean;
  replyCount: number;
};

// The counts returned by every like/unlike call, so the client can reconcile
// its optimistic state without refetching the feed.
export type LikeResultDTO = {
  likeCount: number;
  likedByMe: boolean;
};

export const POST_SORT_FIELDS = [
  'title',
  'createdAt',
  'updatedAt',
  'hot',
  'top',
] as const;

export type PostSortField = (typeof POST_SORT_FIELDS)[number];

export const COMMENT_SORT_FIELDS = ['createdAt', 'updatedAt', 'top'] as const;

export type CommentSortField = (typeof COMMENT_SORT_FIELDS)[number];

// Sentinel accepted in place of a parent id to ask for top-level comments only.
export const ROOT_COMMENTS = 'root';

export type GetAllPostsQueryDTO = PaginationOptions & {
  sortBy?: PostSortField;
  statusId?: number;
  // The viewer, when signed in — drives `likedByMe`. Absent for anonymous reads.
  userId?: string;
};

export type GetPostCommentsQueryDTO = PaginationOptions & {
  postId: string;
  // Omitted or 'root' asks for top-level comments; a uuid asks for that
  // comment's direct replies.
  parentCommentId?: string;
  sortBy?: CommentSortField;
  userId?: string;
};
