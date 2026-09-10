import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { LikeService } from './like.service';
import {
  CreatePostSchema,
  POST_SORT_FIELDS,
  UpdatePostSchema,
  type CreatePostDTO,
  type GetAllPostsQueryDTO,
  type PostSortField,
  type UpdatePostDTO,
} from './forum.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { RoleGuard } from '@/common/guards/role.guard';
import { RolesConfig } from '@auxilium/configs/roles';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

const ROUTE_NAME = 'api/posts';

@Controller(ROUTE_NAME)
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(
    private readonly postService: PostService,
    private readonly likeService: LikeService,
  ) {}

  /**
   * GET /api/posts
   * Fetch all forum posts with pagination and search. Readable signed out —
   * `likedByMe` is simply false for an anonymous reader.
   */
  @Get()
  @AllowAnonymous()
  async getAllPosts(
    @Session() session: UserSession | null,
    @Query() query: Partial<GetAllPostsQueryDTO>,
  ) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      statusId,
      createdBy,
    } = query;

    const result = await this.postService.getAllPosts({
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy: toPostSortField(sortBy),
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      search: search as string,
      statusId: statusId ? Number(statusId) : undefined,
      userId: session?.user?.id,
      createdBy: toAuthorId(createdBy),
    });

    this.logger.verbose(`Retrieved ${result.posts.length} posts successfully.`);

    return {
      status: 'success',
      message: 'Posts retrieved successfully',
      data: result,
    };
  }

  /**
   * POST /api/posts
   * Create a new forum post
   */
  @Post()
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.USER, RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  @HttpCode(201)
  async createPost(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(CreatePostSchema)) body: CreatePostDTO,
  ) {
    const userId = session.user.id;

    this.logger.log(`Creating post with title: ${body.title}`);

    const newPost = await this.postService.createPost({
      ...body,
      createdBy: userId,
    });

    return {
      status: 'success',
      message: 'Post created successfully',
      data: newPost,
    };
  }

  /**
   * GET /api/posts/:postId
   * Fetch a single post. Comments are not embedded — the client requests them
   * one thread level at a time from /api/comments.
   */
  @Get(':postId')
  @AllowAnonymous()
  async getPostById(
    @Session() session: UserSession | null,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    const post = await this.postService.getPostById({
      postId,
      userId: session?.user?.id,
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return {
      status: 'success',
      message: 'Post fetched successfully',
      data: post,
    };
  }

  /**
   * PUT /api/posts/:postId
   * Update a post. Only the author may edit their own post.
   */
  @Put(':postId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.USER, RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async updatePost(
    @Session() session: UserSession,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body(new ZodValidationPipe(UpdatePostSchema)) body: UpdatePostDTO,
  ) {
    const userId = session.user.id;
    const userRoleId = (session.user as any)?.role?.roleId;

    this.logger.log(`Updating post with ID: ${postId}`);

    const updatedPost = await this.postService.updatePost({
      ...body,
      postId,
      userId,
      userRoleId,
    });

    return {
      status: 'success',
      message: 'Post updated successfully',
      data: updatedPost,
    };
  }

  /**
   * POST /api/posts/:postId/like
   * Like a post. Liking twice is a no-op rather than an error.
   */
  @Post(':postId/like')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.USER, RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  // Liking is idempotent, so 200 rather than Nest's default 201 for POST.
  @HttpCode(200)
  async likePost(
    @Session() session: UserSession,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    const result = await this.likeService.likePost({
      postId,
      userId: session.user.id,
    });

    return {
      status: 'success',
      message: 'Post liked successfully',
      data: result,
    };
  }

  /**
   * DELETE /api/posts/:postId/like
   * Remove your like from a post.
   */
  @Delete(':postId/like')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.USER, RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async unlikePost(
    @Session() session: UserSession,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    const result = await this.likeService.unlikePost({
      postId,
      userId: session.user.id,
    });

    return {
      status: 'success',
      message: 'Post unliked successfully',
      data: result,
    };
  }

  /**
   * POST /api/posts/:postId/restore
   * Restore a soft-deleted post
   */
  @Post(':postId/restore')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  // Restoring creates nothing, so 200 rather than Nest's default 201 for POST.
  @HttpCode(200)
  async restorePost(@Param('postId', ParseUUIDPipe) postId: string) {
    await this.postService.restorePost({ postId });

    return {
      status: 'success',
      message: 'Post restored successfully',
    };
  }

  /**
   * DELETE /api/posts/:postId/hard
   * Permanently delete a post and everything under it
   */
  @Delete(':postId/hard')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.SUPERADMIN)
  async hardDeletePost(@Param('postId', ParseUUIDPipe) postId: string) {
    await this.postService.hardDeletePost({ postId });

    return {
      status: 'success',
      message: 'Post permanently deleted successfully',
    };
  }

  /**
   * DELETE /api/posts/:postId
   * Soft delete a post. The author or an admin may do this.
   */
  @Delete(':postId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.USER, RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async deletePost(
    @Session() session: UserSession,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    const userId = session.user.id;
    const userRoleId = (session.user as any)?.role?.roleId;

    await this.postService.deletePost({ postId, userId, userRoleId });

    return {
      status: 'success',
      message: 'Post deleted successfully',
    };
  }
}

/**
 * Query params are not validated by the Zod pipe, so an unknown sortBy would
 * otherwise reach the query builder. Anything unrecognised falls back to newest.
 */
function toPostSortField(value: unknown): PostSortField {
  return POST_SORT_FIELDS.includes(value as PostSortField)
    ? (value as PostSortField)
    : 'createdAt';
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Same reasoning as `toPostSortField` — this one reaches a raw SQL comparison,
 * so anything that is not a uuid is dropped rather than passed along.
 */
function toAuthorId(value: unknown): string | undefined {
  return typeof value === 'string' && UUID_PATTERN.test(value)
    ? value
    : undefined;
}
