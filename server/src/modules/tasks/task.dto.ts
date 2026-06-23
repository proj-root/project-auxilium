import { TaskPriorityEnum, TaskStatusEnum } from '@/config/system.config';
import * as schema from '@/db/schema';
import type { PaginationOptions } from '@auxilium/types/pagination';
import { z } from 'zod';

export type TaskDTO = typeof schema.task.$inferSelect;
export type TaskCommentDTO = typeof schema.taskComment.$inferSelect;

export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title has a maximum of 100 characters'),
  description: z.string().min(1, 'Description is required'),
  assigneeId: z.string().optional(),
  status: z.enum([
    TaskStatusEnum.NOT_STARTED,
    TaskStatusEnum.IN_PROGRESS,
    TaskStatusEnum.COMPLETED,
  ]).optional(),
  priority: z.enum([
    TaskPriorityEnum.LOW,
    TaskPriorityEnum.MEDIUM,
    TaskPriorityEnum.HIGH,
  ]).optional(),
  department: z.coerce.number().optional(),
  deadline: z.coerce.date().optional(),
});

export type CreateTaskDTO = z.infer<typeof CreateTaskSchema> & {
  createdBy: string;
  eventId: string;
};

export const UpdateTaskSchema = z.object({
  title: z.string().trim().max(100, 'Title has a maximum of 100 characters').optional(),
  description: z.string().trim().optional(),
  assigneeId: z.string().optional(),
  status: z.enum([
    TaskStatusEnum.NOT_STARTED,
    TaskStatusEnum.IN_PROGRESS,
    TaskStatusEnum.COMPLETED,
  ]).optional(),
  priority: z.enum([
    TaskPriorityEnum.LOW,
    TaskPriorityEnum.MEDIUM,
    TaskPriorityEnum.HIGH,
  ]).optional(),
  department: z.coerce.number().optional(),
  deadline: z.coerce.date().optional(),
}).refine(
  (data) => Object.values(data).some(value => value !== undefined && value !== ''),
  { message: 'At least one field must be provided for update' }
);

export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema> & {
  taskId: string;
};

export type GetAllEventTasksQueryDTO = PaginationOptions & {
  sortBy?: 'priority' | 'status' | 'createdAt';
}