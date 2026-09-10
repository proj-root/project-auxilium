import type { BaseResponseDTO } from '@/types/dto.types';
import type { PaginationOptions } from '@auxilium/types/pagination';

export interface Creator {
  id: string;
  name: string;
  image: string | null;
}

export interface Post {
  postId: string;
  title: string;
  content: string;
  createdBy: string;
  statusId: number;
  createdAt: string;
  updatedAt: string;
  creator: Creator | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface Comment {
  commentId: string;
  postId: string;
  parentCommentId: string | null;
  text: string;
  createdBy: string;
  statusId: number;
  createdAt: string;
  updatedAt: string;
  creator: Creator | null;
  likeCount: number;
  likedByMe: boolean;
  replyCount: number;
}

// The three orderings offered above the feed. 'latest' maps to the server's
// createdAt sort; 'hot' and 'top' are computed there from like counts.
export const POST_SORTS = ['latest', 'hot', 'top'] as const;

export type PostSort = (typeof POST_SORTS)[number];

export const COMMENT_SORTS = ['top', 'new'] as const;

export type CommentSort = (typeof COMMENT_SORTS)[number];

// Sentinel the API accepts in place of a parent id to ask for top-level
// comments only.
export const ROOT_COMMENTS = 'root';

export interface GetAllPostsRequest extends PaginationOptions {
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'hot' | 'top';
  // Narrows the feed to one author, for their profile page.
  createdBy?: string;
}

export type GetAllPostsResponse = BaseResponseDTO<{
  total: number;
  pageCount: number;
  posts: Post[];
}>;

export type GetPostByIdResponse = BaseResponseDTO<Post>;

export interface GetPostCommentsRequest extends PaginationOptions {
  postId: string;
  // Omitted or 'root' asks for top-level comments; a comment id asks for that
  // comment's direct replies.
  parentCommentId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'top';
}

export type GetPostCommentsResponse = BaseResponseDTO<{
  total: number;
  pageCount: number;
  comments: Comment[];
}>;

export interface CreatePostRequest {
  title: string;
  content: string;
}

export type CreatePostResponse = BaseResponseDTO<Post>;

export interface UpdatePostRequest {
  postId: string;
  title?: string;
  content?: string;
}

export type UpdatePostResponse = BaseResponseDTO<Post>;

export interface CreateCommentRequest {
  postId: string;
  parentCommentId?: string;
  text: string;
}

export type CreateCommentResponse = BaseResponseDTO<Comment>;

export interface UpdateCommentRequest {
  commentId: string;
  text: string;
}

export type UpdateCommentResponse = BaseResponseDTO<Comment>;

// Returned by every like and unlike call so the caller can settle its
// optimistic state without refetching the feed.
export type LikeResponse = BaseResponseDTO<{
  likeCount: number;
  likedByMe: boolean;
}>;
