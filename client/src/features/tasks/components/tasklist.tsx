import {
  CalendarClock,
  Circle,
  MoreHorizontal,
  PlusCircle,
} from 'lucide-react';
import { useGetAllTasksQuery } from '../state/tasks-api-slice';
import { TaskPriorityEnum, TaskStatusEnum, type TaskDTO } from '../tasks.dto';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

function TaskItem({ task }: { task: TaskDTO }) {
  return (
    <div className='flex flex-row justify-between'>
      <div className='flex flex-row items-center gap-2'>
        <button className='cursor-pointer'>
          <Circle
            className={cn(
              'text-muted-foreground size-5',
              task.priority === TaskPriorityEnum.LOW && 'text-green-400',
              task.priority === TaskPriorityEnum.MEDIUM && 'text-yellow-400',
              task.priority === TaskPriorityEnum.HIGH && 'text-red-400',
            )}
          />
        </button>
        <p>{task.title}</p>
      </div>
      <div className='flex flex-row items-center gap-2'>
        {task.deadline && (
          <div className='flex flex-row items-center gap-2'>
            <CalendarClock className='text-muted-foreground size-4' />
            <span className='text-muted-foreground text-sm'>
              {format(new Date(task.deadline), 'dd/MM/yyyy')}
            </span>
          </div>
        )}
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
  const { data, isLoading } = useGetAllTasksQuery({ eventId });

  // Empty State
  if (!isLoading && data?.data && data?.data.length === 0) {
    return (
      <div>
        <p>No tasks yet</p>
      </div>
    );
  }

  // Normal State
  // Consider adding kanban style view option
  if (!isLoading && data?.data && data?.data.length > 0) {
    return (
      <div className='flex h-full flex-col gap-2'>
        {/* Task List */}
        {data?.data.map((item) => (
          <>
            <TaskItem task={item} />
            <Separator className='my-1' />
          </>
        ))}
        {/* Add Task button */}
        <button className='hover:text-primary text-muted-foreground flex cursor-pointer flex-row items-center gap-1 text-left text-sm font-medium'>
          <PlusCircle className='size-4' />
          Add Task
        </button>
      </div>
    );
  }

  // Error State

  // Loading State
  return (
    <div className='flex h-full flex-col'>
      {/* Loading State */}
      {isLoading && <div>Tasks loading...</div>}
    </div>
  );
}
