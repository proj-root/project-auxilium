import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import db from '@/db';
import * as schema from '@/db/schema';
import { forumComment as forumCommentTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { StatusConfig } from '@auxilium/configs/status';
import type {
  CreateCommentDTO,
  GetPostCommentsQueryDTO,
  UpdateCommentDTO,
} from './forum.dto';
import {
  assertCanMutate,
  buildCommentTree,
  findCommentNode,
} from './lib/forum.helpers';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  async getPostComments(args: GetPostCommentsQueryDTO) {
    const {
      postId,
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = args;

    // Build AND conditions for all filters
    const andConditions: object[] = [];
    if (search && search.trim() !== '') {
      andConditions.push({ text: { ilike: `%${search.trim()}%` } });
    }

    const where = {
      postId,
      AND: andConditions.length > 0 ? andConditions : undefined,
    };

    const count = await db.query.forumComment
      .findMany({ where, columns: { commentId: true } })
      .then((comments) => comments.length);

    const comments = await db.query.forumComment.findMany({
      where,
      with: {
        creator: {
          columns: { id: true, name: true, image: true },
        },
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return {
      total: count,
      pageCount: Math.ceil(count / pageSize),
      comments,
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

    const comment = await this.findActiveCommentOrThrow({ commentId });

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
    const comment = await this.findActiveCommentOrThrow({ commentId });

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

  private async findActiveCommentOrThrow({ commentId }: { commentId: string }) {
    const comment = await db.query.forumComment.findFirst({
      where: {
        commentId,
        statusId: { eq: StatusConfig.ACTIVE },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    return comment;
  }
}
