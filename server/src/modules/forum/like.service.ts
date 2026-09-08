import { Injectable, Logger } from '@nestjs/common';
import db from '@/db';
import {
  forumCommentLike as forumCommentLikeTable,
  forumPostLike as forumPostLikeTable,
} from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import type { LikeResultDTO } from './forum.dto';
import {
  findActiveCommentOrThrow,
  findActivePostOrThrow,
} from './lib/forum.helpers';

/**
 * Likes are rows in a join table with a composite primary key, so a like is
 * simply the row existing. Liking and unliking are separate, idempotent calls
 * rather than one toggle: a retried request cannot flip the state back.
 */
@Injectable()
export class LikeService {
  private readonly logger = new Logger(LikeService.name);

  async likePost({ postId, userId }: { postId: string; userId: string }) {
    await findActivePostOrThrow(postId);

    await db
      .insert(forumPostLikeTable)
      .values({ postId, userId })
      .onConflictDoNothing();

    return this.postLikeState({ postId, userId });
  }

  async unlikePost({ postId, userId }: { postId: string; userId: string }) {
    await findActivePostOrThrow(postId);

    await db
      .delete(forumPostLikeTable)
      .where(
        and(
          eq(forumPostLikeTable.postId, postId),
          eq(forumPostLikeTable.userId, userId),
        ),
      );

    return this.postLikeState({ postId, userId });
  }

  async likeComment({
    commentId,
    userId,
  }: {
    commentId: string;
    userId: string;
  }) {
    await findActiveCommentOrThrow(commentId);

    await db
      .insert(forumCommentLikeTable)
      .values({ commentId, userId })
      .onConflictDoNothing();

    return this.commentLikeState({ commentId, userId });
  }

  async unlikeComment({
    commentId,
    userId,
  }: {
    commentId: string;
    userId: string;
  }) {
    await findActiveCommentOrThrow(commentId);

    await db
      .delete(forumCommentLikeTable)
      .where(
        and(
          eq(forumCommentLikeTable.commentId, commentId),
          eq(forumCommentLikeTable.userId, userId),
        ),
      );

    return this.commentLikeState({ commentId, userId });
  }

  /**
   * The counts every like call returns, so the client can settle its optimistic
   * state from the response instead of refetching the feed.
   */
  private async postLikeState({
    postId,
    userId,
  }: {
    postId: string;
    userId: string;
  }): Promise<LikeResultDTO> {
    const [likeCount, mine] = await Promise.all([
      db.$count(forumPostLikeTable, eq(forumPostLikeTable.postId, postId)),
      db.query.forumPostLike.findFirst({ where: { postId, userId } }),
    ]);

    return { likeCount, likedByMe: Boolean(mine) };
  }

  private async commentLikeState({
    commentId,
    userId,
  }: {
    commentId: string;
    userId: string;
  }): Promise<LikeResultDTO> {
    const [likeCount, mine] = await Promise.all([
      db.$count(
        forumCommentLikeTable,
        eq(forumCommentLikeTable.commentId, commentId),
      ),
      db.query.forumCommentLike.findFirst({ where: { commentId, userId } }),
    ]);

    return { likeCount, likedByMe: Boolean(mine) };
  }
}
