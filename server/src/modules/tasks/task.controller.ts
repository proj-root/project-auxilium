import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import {
  CreateTaskSchema,
  type UpdateTaskDTO,
  UpdateTaskSchema,
  type CreateTaskDTO,
} from './task.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { RoleGuard } from '@/common/guards/role.guard';
import { RolesConfig } from '@auxilium/configs/roles';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { EventsService } from '../events/event.service';
import { EventRoleGuard } from '@/common/guards/event-role.guard';
import { EventRoles } from '@/common/decorators/event-roles.decorator';
import { EventRolesConfig } from '@/config/system.config';

const ROUTE_NAME = 'api/events';

@Controller(ROUTE_NAME)
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(
    private readonly tasksService: TaskService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * POST /api/events/:eventId/tasks
   * Create a new task for a specific event
   */
  @Post(':eventId/tasks')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  @HttpCode(201)
  async createTask(
    @Session() session: UserSession,
    @Param('eventId') eventId: string,
    @Body(new ZodValidationPipe(CreateTaskSchema)) body: CreateTaskDTO,
  ) {
    const userId = session.user.id;

    // Implement logic where only people part of the event can create tasks.
    // TODO: Make this more reusable
    const userEventRole = this.eventsService.getUserEventRole({
      userId,
      eventId,
    });

    if (!userEventRole) {
      throw new ForbiddenException(
        `User with ID ${userId} does not have a role in event ${eventId}`,
      );
    }

    this.logger.log(`Creating task with title: ${body.title}`);

    const newTask = await this.tasksService.createTask({
      ...body,
      eventId,
      createdBy: userId,
    });

    return {
      status: 'success',
      message: 'Task created successfully',
      data: newTask,
    };
  }

  /**
   * GET /api/events/:eventId/tasks
   * Fetch all tasks for a specific event
   */
  @Get(':eventId/tasks')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getTasks(@Param('eventId') eventId: string) {
    // Implementation for fetching tasks
  }

  /**
   * GET /api/events/tasks/:taskId
   * Fetch a specific task by its ID
   */
  @Get('tasks/:taskId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getTaskById(@Param('taskId') taskId: string) {
    // Implementation for fetching a specific task by ID
  }

  /**
   * PUT /api/events/tasks/:taskId
   * Update a specific task by its ID
   */
  @Put('tasks/:taskId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async updateTask(
    @Session() session: UserSession,
    @Param('taskId') taskId: string,
    @Body(new ZodValidationPipe(UpdateTaskSchema)) body: UpdateTaskDTO,
  ) {
    const userId = session.user.id;
    const task = await this.tasksService.getTaskById({ taskId });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Implement logic where only people part of the event can update tasks.
    // TODO: Make this more reusable
    const userEventRole = this.eventsService.getUserEventRole({
      userId,
      eventId: task.eventId,
    });

    if (!userEventRole) {
      throw new ForbiddenException(
        `User with ID ${userId} does not have a role in event ${task.eventId}`,
      );
    }

    this.logger.log(`Updating task with ID: ${taskId}`);

    const updatedTask = await this.tasksService.updateTask({
      ...body,
      taskId,
    });

    return {
      status: 'success',
      message: 'Task updated successfully',
      data: updatedTask,
    };
  }

  /**
   * DELETE /api/events/tasks/:taskId
   * Delete a specific task by its ID
   */
  @Delete('tasks/:taskId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async deleteTask(@Param('taskId') taskId: string) {
    // Implementation for deleting a specific task by ID
  }
}
