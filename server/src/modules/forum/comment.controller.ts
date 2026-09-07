import {
  BadRequestException,
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
import { CommentService } from './comment.service';
import {
  CreateCommentSchema,
  UpdateCommentSchema,
  type CreateCommentDTO,
  type GetPostCommentsQueryDTO,
  type UpdateCommentDTO,
} from './forum.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { RoleGuard } from '@/common/guards/role.guard';
import { RolesConfig } from '@auxilium/configs/roles';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

const ROUTE_NAME = 'api/comments';

@Controller(ROUTE_NAME)
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name);

  constructor(private readonly commentService: CommentService) {}

  /**
   * GET /api/comments?postId=...
   * Fetch a flat, paginated list of the comments on one post
   */
  @Get()
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.USER, RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getPostComments(@Query() query: Partial<GetPostCommentsQueryDTO>) {
    const {
      postId,
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = query;

    if (!postId) {
      throw new BadRequestException('postId query parameter is required');
    }

    const result = await this.commentService.getPostComments({
      postId,
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy: (sortBy as 'createdAt' | 'updatedAt') || 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      search: search as string,
    });

    return {
      status: 'success',
      message: 'Comments fetched successfully',
      data: result,
    };
  }

  /**
   * POST /api/comments
   * Create a comment. The postId — and, for a reply, the parentCommentId —
   * are supplied in the JSON payload rather than the URL.
   */
  @Post()
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.USER, RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  @HttpCode(201)
  async createComment(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(CreateCommentSchema)) body: CreateCommentDTO,
  ) {
    const userId = session.user.id;

    this.logger.log(`Creating comment on post: ${body.postId}`);

    const newComment = await this.commentService.createComment({
      ...body,
      createdBy: userId,
    });

    return {
      status: 'success',
      message: 'Comment created successfully',
      data: newComment,
    };
  }

  /**
   * GET /api/comments/:commentId
   * Fetch a single comment with its reply subtree
   */
  @Get(':commentId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.USER, RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getCommentById(@Param('commentId', ParseUUIDPipe) commentId: string) {
    const comment = await this.commentService.getCommentById({ commentId });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    return {
      status: 'success',
      message: 'Comment fetched successfully',
      data: comment,
    };
  }

  /**
   * PUT /api/comments/:commentId
   * Update a comment. Only the author may edit their own comment.
   */
  @Put(':commentId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.USER, RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async updateComment(
    @Session() session: UserSession,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body(new ZodValidationPipe(UpdateCommentSchema)) body: UpdateCommentDTO,
  ) {
    const userId = session.user.id;
    const userRoleId = (session.user as any)?.role?.roleId;

    this.logger.log(`Updating comment with ID: ${commentId}`);

    const updatedComment = await this.commentService.updateComment({
      ...body,
      commentId,
      userId,
      userRoleId,
    });

    return {
      status: 'success',
      message: 'Comment updated successfully',
      data: updatedComment,
    };
  }

  /**
   * DELETE /api/comments/:commentId/hard
   * Permanently delete a comment and every reply beneath it
   */
  @Delete(':commentId/hard')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.SUPERADMIN)
  async hardDeleteComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    await this.commentService.hardDeleteComment({ commentId });

    return {
      status: 'success',
      message: 'Comment permanently deleted successfully',
    };
  }

  /**
   * DELETE /api/comments/:commentId
   * Soft delete a comment. The author or an admin may do this; replies
   * underneath survive as the comment becomes a tombstone.
   */
  @Delete(':commentId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.USER, RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async deleteComment(
    @Session() session: UserSession,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    const userId = session.user.id;
    const userRoleId = (session.user as any)?.role?.roleId;

    await this.commentService.deleteComment({ commentId, userId, userRoleId });

    return {
      status: 'success',
      message: 'Comment deleted successfully',
    };
  }
}
