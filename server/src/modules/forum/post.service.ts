import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import db from '@/db';
import * as schema from '@/db/schema';
import {
  forumComment as forumCommentTable,
  forumPost as forumPostTable,
  forumPostLike as forumPostLikeTable,
  user as userTable,
} from '@/db/schema';
import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  ilike,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { StatusConfig } from '@auxilium/configs/status';
import type {
  CreatePostDTO,
  GetAllPostsQueryDTO,
  PostListItemDTO,
  UpdatePostDTO,
} from './forum.dto';
import { assertCanMutate, findActivePostOrThrow } from './lib/forum.helpers';

// Reddit-style decay: a like nudges a post up the ranking by a fixed amount,
// and every post slides down as it ages. 45000 seconds (12.5h) is the scale at
// which a day-old thread stays competitive with a fresh one.
const HOT_LIKE_WEIGHT = 2;
const HOT_AGE_DIVISOR = 45000;

// Both counts must be DISTINCT: joining likes and comments together multiplies
// the rows, so a plain count() would inflate each by the size of the other.
const likeCountExpr = countDistinct(forumPostLikeTable.userId);
const commentCountExpr = countDistinct(forumCommentTable.commentId);

const hotScoreExpr = sql<number>`log(greatest(${likeCountExpr}, 1)::numeric) * ${HOT_LIKE_WEIGHT} + extract(epoch from ${forumPostTable.createdAt}) / ${HOT_AGE_DIVISOR}`;

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  async getAllPosts(args: GetAllPostsQueryDTO) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      statusId = StatusConfig.ACTIVE,
      userId,
    } = args;

    const filters: SQL[] = [eq(forumPostTable.statusId, statusId)];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      filters.push(
        or(
          ilike(forumPostTable.title, term),
          ilike(forumPostTable.content, term),
        ) as SQL,
      );
    }

    const where = and(...filters);

    const total = await db.$count(forumPostTable, where);

    const rows = await this.postQuery(userId)
      .where(where)
      .groupBy(forumPostTable.postId, userTable.id)
      .orderBy(...this.orderFor(sortBy, sortOrder))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      total,
      pageCount: Math.ceil(total / pageSize),
      posts: rows.map(toPostListItem),
    };
  }

  async getPostById({ postId, userId }: { postId: string; userId?: string }) {
    const [row] = await this.postQuery(userId)
      .where(
        and(
          eq(forumPostTable.postId, postId),
          eq(forumPostTable.statusId, StatusConfig.ACTIVE),
        ),
      )
      .groupBy(forumPostTable.postId, userTable.id)
      .limit(1);

    if (!row) return undefined;

    return toPostListItem(row);
  }

  async createPost(args: CreatePostDTO) {
    const [post] = await db.insert(schema.forumPost).values(args).returning();

    if (!post) {
      throw new Error('Failed to create post');
    }

    return post;
  }

  async updatePost(
    args: UpdatePostDTO & { userId: string; userRoleId?: number },
  ) {
    const { postId, userId, userRoleId, ...updateData } = args;

    const post = await findActivePostOrThrow(postId);

    // Editing is author-only; admins may remove a post but not rewrite it.
    assertCanMutate({
      row: post,
      userId,
      userRoleId,
      allowAdmin: false,
      subject: 'posts',
    });

    const [updatedPost] = await db
      .update(forumPostTable)
      .set(updateData)
      .where(eq(forumPostTable.postId, postId))
      .returning();

    return updatedPost;
  }

  async deletePost({
    postId,
    userId,
    userRoleId,
  }: {
    postId: string;
    userId: string;
    userRoleId?: number;
  }) {
    const post = await findActivePostOrThrow(postId);

    assertCanMutate({
      row: post,
      userId,
      userRoleId,
      allowAdmin: true,
      subject: 'posts',
    });

    const [deletedPost] = await db
      .update(forumPostTable)
      .set({ statusId: StatusConfig.DELETED })
      .where(eq(forumPostTable.postId, postId))
      .returning();

    this.logger.log(`Soft deleted post with ID: ${postId}`);

    return deletedPost;
  }

  async restorePost({ postId }: { postId: string }) {
    const [restoredPost] = await db
      .update(forumPostTable)
      .set({ statusId: StatusConfig.ACTIVE })
      .where(eq(forumPostTable.postId, postId))
      .returning();

    if (!restoredPost) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return restoredPost;
  }

  async hardDeletePost({ postId }: { postId: string }) {
    const deletedPost = await db
      .delete(forumPostTable)
      .where(eq(forumPostTable.postId, postId))
      .returning();

    if (deletedPost.length === 0) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return deletedPost;
  }

  /**
   * The post row plus its author and aggregates. Built with left joins rather
   * than the relational API because `hot` and `top` order by computed columns,
   * which the object-shaped `orderBy` of db.query cannot express.
   */
  private postQuery(userId?: string) {
    return db
      .select({
        postId: forumPostTable.postId,
        title: forumPostTable.title,
        content: forumPostTable.content,
        createdBy: forumPostTable.createdBy,
        statusId: forumPostTable.statusId,
        createdAt: forumPostTable.createdAt,
        updatedAt: forumPostTable.updatedAt,
        creatorId: userTable.id,
        creatorName: userTable.name,
        creatorImage: userTable.image,
        likeCount: likeCountExpr,
        commentCount: commentCountExpr,
        likedByMe: likedByMeExpr(userId),
      })
      .from(forumPostTable)
      .leftJoin(userTable, eq(userTable.id, forumPostTable.createdBy))
      .leftJoin(
        forumPostLikeTable,
        eq(forumPostLikeTable.postId, forumPostTable.postId),
      )
      .leftJoin(
        forumCommentTable,
        and(
          eq(forumCommentTable.postId, forumPostTable.postId),
          eq(forumCommentTable.statusId, StatusConfig.ACTIVE),
        ),
      );
  }

  private orderFor(
    sortBy: NonNullable<GetAllPostsQueryDTO['sortBy']>,
    sortOrder: 'asc' | 'desc',
  ) {
    if (sortBy === 'hot') {
      return [desc(hotScoreExpr), desc(forumPostTable.createdAt)];
    }

    if (sortBy === 'top') {
      return [desc(likeCountExpr), desc(forumPostTable.createdAt)];
    }

    const column = {
      title: forumPostTable.title,
      createdAt: forumPostTable.createdAt,
      updatedAt: forumPostTable.updatedAt,
    }[sortBy];

    return [sortOrder === 'asc' ? asc(column) : desc(column)];
  }
}

/**
 * Whether the viewer has liked the post. An EXISTS subquery rather than another
 * join, so it stays out of the GROUP BY and cannot skew the counts.
 */
function likedByMeExpr(userId?: string) {
  if (!userId) return sql<boolean>`false`;

  return sql<boolean>`exists (select 1 from forum_post_like pl where pl.post_id = ${forumPostTable.postId} and pl.user_id = ${userId})`;
}

type PostRow = Omit<
  PostListItemDTO,
  'creator' | 'likeCount' | 'commentCount' | 'likedByMe'
> & {
  creatorId: string | null;
  creatorName: string | null;
  creatorImage: string | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

function toPostListItem(row: PostRow): PostListItemDTO {
  const { creatorId, creatorName, creatorImage, ...post } = row;

  return {
    ...post,
    creator: creatorId
      ? { id: creatorId, name: creatorName ?? '', image: creatorImage }
      : null,
    likeCount: Number(post.likeCount),
    commentCount: Number(post.commentCount),
    likedByMe: Boolean(post.likedByMe),
  };
}
