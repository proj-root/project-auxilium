import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateTaskDTO,
  GetAllEventTasksQueryDTO,
  UpdateTaskDTO,
} from './task.dto';
import db from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { format } from 'date-fns';

@Injectable()
export class TaskService {
  async getTaskById({ taskId }: { taskId: string }) {
    const task = await db.query.task.findFirst({
      where: {
        taskId,
      },
      with: {
        creator: {
          with: {
            userProfile: {
              columns: {
                ichat: true,
              },
            },
          },
        },
        assignee: {
          with: {
            userProfile: {
              columns: {
                ichat: true,
              },
            },
          },
        },
        department: true,
        comments: {
          with: {
            creator: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
      },
    });

    return task;
  }

  async getAllEventTasks(args: GetAllEventTasksQueryDTO & { eventId: string }) {
    const {
      eventId,
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = args;

    // Build AND conditions for all filters
    const andConditions: object[] = [];
    if (search && search.trim() !== '') {
      andConditions.push({
        title: { ilike: `%${search.trim()}%` },
      });
    }

    const tasks = await db.query.task.findMany({
      where: {
        eventId,
        AND: andConditions.length > 0 ? andConditions : undefined,
      },
      with: {
        assignee: true,
        creator: true,
        department: true,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return tasks;
  }

  // Create a new task
  async createTask(args: CreateTaskDTO) {
    // TODO: Check that assignee is a member of the event + ADMIN

    const { deadline, ...rest } = args;

    const newTask = await db.transaction(async (tx) => {
      // Insert the new task
      const [task] = await tx
        .insert(schema.task)
        .values({
          deadline: deadline ? new Date(deadline) : undefined,
          ...rest,
        })
        .returning();

      if (!task) {
        throw new Error('Failed to create task');
      }

      const creator = await tx.query.user.findFirst({
        where: {
          id: rest.createdBy,
        },
      });

      // Insert initial comment
      await tx.insert(schema.taskComment).values({
        taskId: task.taskId,
        text: `Task created by ${creator?.name}`,
        createdBy: rest.createdBy,
      });

      return task;
    });

    return newTask;
  }

  // Update an existing task
  async updateTask(args: UpdateTaskDTO) {
    const { taskId, userId, deadline, ...rest } = args;

    const updatedTask = await db.transaction(async (tx) => {
      const task = await tx.query.task.findFirst({
        where: {
          taskId,
        },
      });

      // Check if assignee is part of the event
      let assignee;
      if (rest.assigneeId) {
        assignee = await tx.query.userEventRole.findFirst({
          where: {
            eventId: task?.eventId,
            userId: rest.assigneeId,
          },
          with: {
            user: {
              columns: {
                name: true
              }
            }
          }
        });

        if (!assignee)
          throw new BadRequestException(
            'Assignee must be involved in event. Share the event with the assignee first.',
          );
      }

      const updatedTask = await tx
        .update(schema.task)
        .set({
          deadline: deadline ? new Date(deadline) : undefined,
          ...rest,
        })
        .where(eq(schema.task.taskId, taskId))
        .returning();

      let message = '';
      if (deadline)
        message = `Set deadline to ${format(new Date(deadline), 'do MM yyyy')}`;
      if (rest.priority) message = `Set priority to ${rest.priority}`;
      if (rest.status) message = `Set status to "${rest.status}"`;
      if (assignee) message = `Assigned task to ${assignee.user.name}`;
      if (rest.title) message = `Changed title to "${rest.title}"`;
      if (rest.description) message = `Changed description to "${rest.description}"`;

      if (message !== '') {
        await tx.insert(schema.taskComment).values({
          taskId,
          text: message,
          createdBy: userId,
        });
      }

      return updatedTask;
    });

    return updatedTask;
  }

  async deleteTask({ taskId }: { taskId: string }) {
    const deletedTask = await db
      .delete(schema.task)
      .where(eq(schema.task.taskId, taskId))
      .returning();

    return deletedTask;
  }
}
