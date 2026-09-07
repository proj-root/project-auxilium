import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import db from '@/db';
import * as schema from '@/db/schema';
import { forumPost as forumPostTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { StatusConfig } from '@auxilium/configs/status';
import type {
  CreatePostDTO,
  GetAllPostsQueryDTO,
  UpdatePostDTO,
} from './forum.dto';
import { assertCanMutate, buildCommentTree } from './lib/forum.helpers';

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
    } = args;

    // Build AND conditions for all filters
    const andConditions: object[] = [];
    if (search && search.trim() !== '') {
      andConditions.push({
        OR: [
          { title: { ilike: `%${search.trim()}%` } },
          { content: { ilike: `%${search.trim()}%` } },
        ],
      });
    }
    if (statusId !== undefined) {
      andConditions.push({ statusId: { eq: statusId } });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : undefined;

    const count = await db.query.forumPost
      .findMany({ where, columns: { postId: true } })
      .then((posts) => posts.length);

    const posts = await db.query.forumPost.findMany({
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
      posts,
    };
  }

  async getPostById({ postId }: { postId: string }) {
    const post = await db.query.forumPost.findFirst({
      where: {
        postId,
        statusId: { eq: StatusConfig.ACTIVE },
      },
      with: {
        creator: {
          columns: { id: true, name: true, image: true },
        },
      },
    });

    if (!post) return undefined;

    // Fetch the whole thread flat and assemble it in memory — this supports
    // replies at any depth without a recursive query.
    const comments = await db.query.forumComment.findMany({
      where: { postId },
      with: {
        creator: {
          columns: { id: true, name: true, image: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      ...post,
      comments: buildCommentTree(comments),
    };
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

    const post = await this.findActivePostOrThrow({ postId });

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
    const post = await this.findActivePostOrThrow({ postId });

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

  private async findActivePostOrThrow({ postId }: { postId: string }) {
    const post = await db.query.forumPost.findFirst({
      where: {
        postId,
        statusId: { eq: StatusConfig.ACTIVE },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return post;
  }
}
