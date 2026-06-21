import { Injectable } from '@nestjs/common';
import { CreateTaskDTO, UpdateTaskDTO } from './task.dto';
import db from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class TaskService {
  async getTaskById({ taskId }: { taskId: string }) {
    const task = await db.query.task.findFirst({
      where: {
        taskId,
      },
    });

    return task;
  }

  // Create a new task
  async createTask(args: CreateTaskDTO) {
    const { deadline, ...rest } = args;

    const [newTask] = await db
      .insert(schema.task)
      .values({
        deadline: deadline ? new Date(deadline) : undefined,
        ...rest,
      })
      .returning();

    // TODO: Initialise with new task comment

    return newTask;
  }

  // Update an existing task
  async updateTask(args: UpdateTaskDTO) {
    const { taskId, deadline, ...rest } = args;

    const [updatedTask] = await db
      .update(schema.task)
      .set({
        deadline: deadline ? new Date(deadline) : undefined,
        ...rest,
      })
      .where(eq(schema.task.taskId, taskId))
      .returning();

    return updatedTask;
  }
}
