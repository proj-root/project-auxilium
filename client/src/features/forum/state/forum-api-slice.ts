import { apiSlice } from '@/state/api-slice';
import {
  ROOT_COMMENTS,
  type CreateCommentRequest,
  type CreateCommentResponse,
  type CreatePostRequest,
  type CreatePostResponse,
  type GetAllPostsRequest,
  type GetAllPostsResponse,
  type GetPostByIdResponse,
  type GetPostCommentsRequest,
  type GetPostCommentsResponse,
  type LikeResponse,
  type UpdateCommentRequest,
  type UpdateCommentResponse,
  type UpdatePostRequest,
  type UpdatePostResponse,
} from '../forum.dto';

export const forumApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPosts: builder.query<GetAllPostsResponse, GetAllPostsRequest>({
      query: (params) => ({
        url: '/posts',
        method: 'GET',
        params,
      }),
      // The feed accumulates instead of replacing: every page after the first
      // is appended to the cache entry for the same sort, search and author.
      // `createdBy` has to be part of the key — without it a profile's filtered
      // list and the main feed share one entry and merge into each other.
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}(${queryArgs.sortBy ?? ''}|${queryArgs.search ?? ''}|${queryArgs.createdBy ?? ''})`,
      merge: (cache, incoming, { arg }) => {
        // Page one is the authoritative head of the list. A refetch of it —
        // after a new post, an edit, or a delete — has to replace what was
        // accumulated; appending would leave the stale copy in place.
        if ((arg.page ?? 1) <= 1) {
          cache.data = incoming.data;
          return;
        }

        if (incoming.data.posts.length === 0) return;

        const seen = new Set(cache.data.posts.map((post) => post.postId));

        cache.data.total = incoming.data.total;
        cache.data.pageCount = incoming.data.pageCount;
        cache.data.posts.push(
          ...incoming.data.posts.filter((post) => !seen.has(post.postId)),
        );
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: ['Posts'],
    }),
    getPostById: builder.query<GetPostByIdResponse, { postId: string }>({
      query: ({ postId }) => ({
        url: `/posts/${postId}`,
        method: 'GET',
      }),
      providesTags: ['Posts'],
    }),
    createPost: builder.mutation<CreatePostResponse, CreatePostRequest>({
      query: (data) => ({
        url: '/posts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Posts'],
    }),
    updatePost: builder.mutation<UpdatePostResponse, UpdatePostRequest>({
      query: ({ postId, ...data }) => ({
        url: `/posts/${postId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Posts'],
    }),
    deletePost: builder.mutation<void, { postId: string }>({
      query: ({ postId }) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Posts'],
    }),
    getPostComments: builder.query<
      GetPostCommentsResponse,
      GetPostCommentsRequest
    >({
      query: (params) => ({
        url: '/comments',
        method: 'GET',
        params,
      }),
      // One cache entry per thread level, each accumulating its own pages.
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}(${queryArgs.postId}|${
          queryArgs.parentCommentId ?? ROOT_COMMENTS
        }|${queryArgs.sortBy ?? ''})`,
      merge: (cache, incoming, { arg }) => {
        // As above: the first page of a level is authoritative, so an edited
        // or tombstoned comment replaces the copy already on screen.
        if ((arg.page ?? 1) <= 1) {
          cache.data = incoming.data;
          return;
        }

        if (incoming.data.comments.length === 0) return;

        const seen = new Set(
          cache.data.comments.map((comment) => comment.commentId),
        );

        cache.data.total = incoming.data.total;
        cache.data.pageCount = incoming.data.pageCount;
        cache.data.comments.push(
          ...incoming.data.comments.filter(
            (comment) => !seen.has(comment.commentId),
          ),
        );
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: ['Comments'],
    }),
    createComment: builder.mutation<
      CreateCommentResponse,
      CreateCommentRequest
    >({
      query: (data) => ({
        url: '/comments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Comments', 'Posts'],
    }),
    updateComment: builder.mutation<
      UpdateCommentResponse,
      UpdateCommentRequest
    >({
      query: ({ commentId, ...data }) => ({
        url: `/comments/${commentId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Comments'],
    }),
    deleteComment: builder.mutation<void, { commentId: string }>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comments', 'Posts'],
    }),
    // Likes deliberately invalidate nothing: refetching the feed on every tap
    // would reset an infinite scroll. The response carries the settled counts,
    // and the button reconciles from that.
    likePost: builder.mutation<LikeResponse, { postId: string }>({
      query: ({ postId }) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
    }),
    unlikePost: builder.mutation<LikeResponse, { postId: string }>({
      query: ({ postId }) => ({
        url: `/posts/${postId}/like`,
        method: 'DELETE',
      }),
    }),
    likeComment: builder.mutation<LikeResponse, { commentId: string }>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}/like`,
        method: 'POST',
      }),
    }),
    unlikeComment: builder.mutation<LikeResponse, { commentId: string }>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}/like`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetAllPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetPostCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
} = forumApiSlice;
