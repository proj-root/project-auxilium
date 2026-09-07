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

export type GetAllPostsQueryDTO = PaginationOptions & {
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  statusId?: number;
};

export type GetPostCommentsQueryDTO = PaginationOptions & {
  postId: string;
  sortBy?: 'createdAt' | 'updatedAt';
};
