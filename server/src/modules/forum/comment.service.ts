import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import db from '@/db';
import * as schema from '@/db/schema';
import {
  forumComment as forumCommentTable,
  forumCommentLike as forumCommentLikeTable,
  user as userTable,
} from '@/db/schema';
import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  ilike,
  isNull,
  sql,
  type SQL,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { StatusConfig } from '@auxilium/configs/status';
import {
  ROOT_COMMENTS,
  type CommentListItemDTO,
  type CreateCommentDTO,
  type GetPostCommentsQueryDTO,
  type UpdateCommentDTO,
} from './forum.dto';
import {
  assertCanMutate,
  buildCommentTree,
  findActiveCommentOrThrow,
  findCommentNode,
  tombstone,
} from './lib/forum.helpers';

// Self-join used only to count a comment's direct replies.
const childComment = alias(forumCommentTable, 'child_comment');

const likeCountExpr = countDistinct(forumCommentLikeTable.userId);
const replyCountExpr = countDistinct(childComment.commentId);

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  /**
   * One level of a thread. With no `parentCommentId` this returns the post's
   * top-level comments; with one, that comment's direct replies. Replies are
   * never nested in the response — the client asks for the next level when the
   * reader expands it.
   */
  async getPostComments(args: GetPostCommentsQueryDTO) {
    const {
      postId,
      parentCommentId,
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      userId,
    } = args;

    const isRootLevel = !parentCommentId || parentCommentId === ROOT_COMMENTS;

    const filters: SQL[] = [
      eq(forumCommentTable.postId, postId),
      isRootLevel
        ? isNull(forumCommentTable.parentCommentId)
        : eq(forumCommentTable.parentCommentId, parentCommentId),
    ];

    if (search && search.trim() !== '') {
      filters.push(ilike(forumCommentTable.text, `%${search.trim()}%`));
    }

    const where = and(...filters);

    const total = await db.$count(forumCommentTable, where);

    const rows = await db
      .select({
        commentId: forumCommentTable.commentId,
        postId: forumCommentTable.postId,
        parentCommentId: forumCommentTable.parentCommentId,
        text: forumCommentTable.text,
        createdBy: forumCommentTable.createdBy,
        statusId: forumCommentTable.statusId,
        createdAt: forumCommentTable.createdAt,
        updatedAt: forumCommentTable.updatedAt,
        creatorId: userTable.id,
        creatorName: userTable.name,
        creatorImage: userTable.image,
        likeCount: likeCountExpr,
        replyCount: replyCountExpr,
        likedByMe: likedByMeExpr(userId),
      })
      .from(forumCommentTable)
      .leftJoin(userTable, eq(userTable.id, forumCommentTable.createdBy))
      .leftJoin(
        forumCommentLikeTable,
        eq(forumCommentLikeTable.commentId, forumCommentTable.commentId),
      )
      .leftJoin(
        childComment,
        eq(childComment.parentCommentId, forumCommentTable.commentId),
      )
      .where(where)
      .groupBy(forumCommentTable.commentId, userTable.id)
      .orderBy(...this.orderFor(sortBy, sortOrder, isRootLevel))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      total,
      pageCount: Math.ceil(total / pageSize),
      comments: rows.map(toCommentListItem),
    };
  }

  async getCommentById({ commentId }: { commentId: string }) {
    const comment = await db.query.forumComment.findFirst({
      where: { commentId },
      with: {
        creator: {
          columns: { id: true, name: true, image: true },
        },
      },
    });

    if (!comment) return undefined;

    // Return the comment with its own reply subtree attached.
    const thread = await db.query.forumComment.findMany({
      where: { postId: comment.postId },
      with: {
        creator: {
          columns: { id: true, name: true, image: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return findCommentNode(buildCommentTree(thread), commentId);
  }

  async createComment(args: CreateCommentDTO) {
    const { postId, parentCommentId, ...rest } = args;

    const post = await db.query.forumPost.findFirst({
      where: {
        postId,
        statusId: { eq: StatusConfig.ACTIVE },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    if (parentCommentId) {
      const parent = await db.query.forumComment.findFirst({
        where: { commentId: parentCommentId },
      });

      if (!parent) {
        throw new NotFoundException(
          `Comment with ID ${parentCommentId} not found`,
        );
      }

      // A reply must stay within the thread it is replying to.
      if (parent.postId !== postId) {
        throw new BadRequestException(
          'Parent comment does not belong to the specified post',
        );
      }
    }

    const [comment] = await db
      .insert(schema.forumComment)
      .values({ postId, parentCommentId, ...rest })
      .returning();

    if (!comment) {
      throw new Error('Failed to create comment');
    }

    return comment;
  }

  async updateComment(
    args: UpdateCommentDTO & { userId: string; userRoleId?: number },
  ) {
    const { commentId, userId, userRoleId, ...updateData } = args;

    const comment = await findActiveCommentOrThrow(commentId);

    assertCanMutate({
      row: comment,
      userId,
      userRoleId,
      allowAdmin: false,
      subject: 'comments',
    });

    const [updatedComment] = await db
      .update(forumCommentTable)
      .set(updateData)
      .where(eq(forumCommentTable.commentId, commentId))
      .returning();

    return updatedComment;
  }

  async deleteComment({
    commentId,
    userId,
    userRoleId,
  }: {
    commentId: string;
    userId: string;
    userRoleId?: number;
  }) {
    const comment = await findActiveCommentOrThrow(commentId);

    assertCanMutate({
      row: comment,
      userId,
      userRoleId,
      allowAdmin: true,
      subject: 'comments',
    });

    // Soft delete only — replies underneath this comment must survive, so the
    // row stays and is rendered as a tombstone.
    const [deletedComment] = await db
      .update(forumCommentTable)
      .set({ statusId: StatusConfig.DELETED })
      .where(eq(forumCommentTable.commentId, commentId))
      .returning();

    this.logger.log(`Soft deleted comment with ID: ${commentId}`);

    return deletedComment;
  }

  async hardDeleteComment({ commentId }: { commentId: string }) {
    const deletedComment = await db
      .delete(forumCommentTable)
      .where(eq(forumCommentTable.commentId, commentId))
      .returning();

    if (deletedComment.length === 0) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    return deletedComment;
  }

  private orderFor(
    sortBy: NonNullable<GetPostCommentsQueryDTO['sortBy']>,
    sortOrder: 'asc' | 'desc',
    isRootLevel: boolean,
  ) {
    // Replies read as a conversation, so they stay chronological whatever the
    // caller asked for. Only the top level is sortable.
    if (!isRootLevel) return [asc(forumCommentTable.createdAt)];

    if (sortBy === 'top') {
      return [desc(likeCountExpr), asc(forumCommentTable.createdAt)];
    }

    const column =
      sortBy === 'updatedAt'
        ? forumCommentTable.updatedAt
        : forumCommentTable.createdAt;

    return [sortOrder === 'asc' ? asc(column) : desc(column)];
  }
}

function likedByMeExpr(userId?: string) {
  if (!userId) return sql<boolean>`false`;

  return sql<boolean>`exists (select 1 from forum_comment_like cl where cl.comment_id = ${forumCommentTable.commentId} and cl.user_id = ${userId})`;
}

type CommentRow = Omit<
  CommentListItemDTO,
  'creator' | 'likeCount' | 'likedByMe' | 'replyCount'
> & {
  creatorId: string | null;
  creatorName: string | null;
  creatorImage: string | null;
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
};

function toCommentListItem(row: CommentRow): CommentListItemDTO {
  const { creatorId, creatorName, creatorImage, ...comment } = row;

  const withCreator = {
    ...comment,
    creator: creatorId
      ? { id: creatorId, name: creatorName ?? '', image: creatorImage }
      : null,
  };

  // A deleted comment still has to be returned or its replies become
  // unreachable — it comes back as a tombstone with its likes stripped.
  const visible = tombstone(withCreator);
  const isDeleted = comment.statusId === StatusConfig.DELETED;

  return {
    ...visible,
    creator: visible.creator ?? null,
    likeCount: isDeleted ? 0 : Number(comment.likeCount),
    likedByMe: isDeleted ? false : Boolean(comment.likedByMe),
    replyCount: Number(comment.replyCount),
  };
}
