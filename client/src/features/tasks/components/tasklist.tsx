import {
  Bird,
  CalendarClock,
  Circle,
  CircleCheckBig,
  MoreHorizontal,
  User2,
} from 'lucide-react';
import {
  useGetAllTasksQuery,
  useUpdateTaskMutation,
} from '../state/tasks-api-slice';
import { TaskPriorityEnum, TaskStatusEnum, type TaskDTO } from '../tasks.dto';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SingleTaskDialog } from './single-task-dialog';
import { useState } from 'react';
import { CreateTaskForm } from './create-task-form';
import { TaskContextMenu } from './task-context-menu';
import { AssignTaskPopover } from './assign-task-popover';
import { DeadlinePopover } from './deadline-popover';
import { StatusPopover } from './status-popover';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

function TaskItem({ task }: { task: TaskDTO }) {
  const [updateTask] = useUpdateTaskMutation();

  const handleComplete = async () => {
    try {
      await updateTask({
        taskId: task.taskId,
        status: TaskStatusEnum.COMPLETED,
      }).unwrap();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data.message);
    }
  };

  return (
    <div className='flex w-full flex-row justify-between gap-2'>
      <div className='flex w-full flex-row items-center gap-2'>
        <button
          disabled={task.status === TaskStatusEnum.COMPLETED}
          className='cursor-pointer'
          onClick={() => handleComplete()}
        >
          {task.status !== TaskStatusEnum.COMPLETED ? (
            <Circle
              className={cn(
                'text-muted-foreground size-5',
                task.priority === TaskPriorityEnum.LOW && 'text-green-400',
                task.priority === TaskPriorityEnum.MEDIUM && 'text-yellow-400',
                task.priority === TaskPriorityEnum.HIGH && 'text-red-400',
              )}
            />
          ) : (
            <CircleCheckBig className='text-muted-foreground size-5' />
          )}
        </button>
        <TaskContextMenu task={task}>
          <SingleTaskDialog task={task}>
            <p
              className={cn(
                task.status === TaskStatusEnum.COMPLETED && 'line-through',
              )}
            >
              {task.title}
            </p>
          </SingleTaskDialog>
        </TaskContextMenu>
      </div>
      <div className='flex flex-row items-center gap-2'>
        <AssignTaskPopover task={task}>
          <Avatar className='size-6'>
            <AvatarImage src={task.assignee?.image} alt={task.assignee?.name} />
            <AvatarFallback>
              {task.assignee ? (
                <p>{task.assignee?.name.charAt(0).toUpperCase()}</p>
              ) : (
                <User2 className='size-4' />
              )}
            </AvatarFallback>
          </Avatar>
        </AssignTaskPopover>
        <DeadlinePopover
          taskId={task.taskId}
          deadline={task.deadline ?? undefined}
        >
          <div className='flex flex-row items-center gap-1.5'>
            <CalendarClock className='text-muted-foreground size-4' />
            <span className='text-muted-foreground text-sm text-nowrap'>
              {task.deadline
                ? format(new Date(task.deadline), 'do MMM yyyy')
                : 'No deadline'}
            </span>
          </div>
        </DeadlinePopover>
        <StatusPopover taskId={task.taskId} status={task.status}>
          <Badge
            variant={'outline'}
            className={cn(
              task.status === TaskStatusEnum.NOT_STARTED &&
                'text-muted-foreground',
              task.status === TaskStatusEnum.IN_PROGRESS &&
                'border-blue-400 text-blue-400',
              task.status === TaskStatusEnum.COMPLETED &&
                'border-green-400 text-green-400',
            )}
          >
            {task.status}
          </Badge>
        </StatusPopover>
        <Button
          variant={'ghost'}
          size={'icon-xs'}
          className='hover:bg-transparent'
        >
          <MoreHorizontal className='size-4' />
        </Button>
      </div>
    </div>
  );
}

export function EventTaskList({ eventId }: { eventId: string }) {
  const { data, isLoading, isError } = useGetAllTasksQuery({ eventId });

  // Error State
  if (!isLoading && isError) {
    return (
      <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
        <img src='/not-found.png' alt='An error occurred' className='w-1/3' />
        <div className='flex flex-col items-center'>
          <p className='text-2xl'>An error occurred...</p>
          <p className='text-muted-foreground'>Welp that's on me</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!isLoading && data?.data && data?.data.length === 0) {
    return (
      <div className='flex h-full flex-col gap-2'>
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed p-10'>
          <Bird className='size-10 mb-2' />
          <div className='flex flex-col items-center'>
            <h1 className='text-xl'>No tasks yet...</h1>
            <p className='text-muted-foreground'>Feels kinda empty in here</p>
          </div>
        </div>
        <Separator className='my-1' />
        {/* Add Task button */}
        <CreateTaskForm eventId={eventId} />
      </div>
    );
  }

  // Normal State
  // Consider adding kanban style view option
  if (!isLoading && data?.data && data?.data.length > 0) {
    return (
      <div className='flex h-full flex-col gap-2 overflow-y-auto'>
        {/* Task List */}
        {data?.data.map((item) => (
          <div className='flex flex-col gap-1' key={item.taskId}>
            <TaskItem task={item} />
            <Separator className='my-1' />
          </div>
        ))}
        {/* Add Task button */}
        <CreateTaskForm eventId={eventId} />
      </div>
    );
  }

  // Loading State
  return (
    <div className='flex flex-col gap-2'>
      {Array.from({ length: 10 }).map(() => {
        return (
          <div className='flex flex-col gap-1'>
            <div className='flex flex-row items-center justify-between gap-2'>
              <div className='flex flex-row items-center gap-2'>
                <Circle className='text-muted-foreground size-5 animate-pulse' />
                <Skeleton className='h-5 w-70 rounded-md' />
              </div>
              <div className='flex flex-row items-center gap-2'>
                <Skeleton className='h-6 w-6 rounded-full' />
                <Skeleton className='h-5 w-20 rounded-md' />
                <Skeleton className='h-5 w-20 rounded-full' />
              </div>
            </div>
            <Separator className='my-1' />
          </div>
        );
      })}
    </div>
  );
}
