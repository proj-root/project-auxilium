import type { BaseResponseDTO } from '@/types/dto.types';
import type { PaginationOptions } from '@auxilium/types/pagination';
import type { DepartmentDTO, UserDTO } from '../user/user.dto';

export enum TaskStatusEnum {
  NOT_STARTED = 'Not started',
  IN_PROGRESS = 'In progress',
  COMPLETED = 'Completed',
}

export enum TaskPriorityEnum {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface TaskDTO {
  taskId: string;
  eventId: string;
  assigneeId: string | null;
  assignee: UserDTO | null;
  createdBy: string;
  title: string;
  description: string | null;
  status: TaskStatusEnum;
  priority: TaskPriorityEnum;
  departmentId: string | null;
  department: DepartmentDTO;
  deadline: Date | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCommentDTO {
  taskCommentId: string;
  taskId: string;
  text: string;
  creator: UserDTO;
  createdAt: string;
}

export interface CreateTaskRequest {
  eventId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  status?: TaskStatusEnum;
  priority?: TaskPriorityEnum;
  department?: number;
  deadline?: Date;
}

export type CreateTaskResponse = BaseResponseDTO<void>;

export interface GetAllTasksRequest extends PaginationOptions {
  eventId: string;
}

export type GetAllTasksResponse = BaseResponseDTO<TaskDTO[]>;

export interface GetTaskByIdRequest {
  taskId: string;
}

export type GetTaskByIdResponnse = BaseResponseDTO<
  TaskDTO & {
    comments: TaskCommentDTO[];
  }
>;
