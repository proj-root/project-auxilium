import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useDeleteTaskMutation,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
} from '../state/tasks-api-slice';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckCircle,
  Circle,
  CircleDashed,
  Flag,
  Plus,
  Trash2,
  User2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TaskPriorityEnum,
  TaskStatusEnum,
  type TaskCommentDTO,
  type TaskDTO,
} from '../tasks.dto';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
  useGetPersonalDetailsQuery,
  useGetSingleUserQuery,
} from '@/features/user/state/user-api-slice';
import { authClient } from '@/lib/auth-client';
import { AssignTaskPopover } from './assign-task-popover';
import { toast } from 'sonner';
import { StatusPopover } from './status-popover';
import { DeadlinePopover } from './deadline-popover';
import { InlineTextEdit } from '@/components/inline-text-edit';

function TaskComment({ comment }: { comment: TaskCommentDTO }) {
  return (
    <div className='flex flex-row gap-3 px-1'>
      <Avatar>
        <AvatarImage src={comment.creator.image} />
        <AvatarFallback>{comment.creator.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className='flex w-full flex-col gap-1 text-sm'>
        <div className='flex flex-row gap-2'>
          <p className='font-medium'>{comment.creator.name}</p>
          <p className='text-muted-foreground font-light'>
            {formatDistanceToNowStrict(comment.createdAt, { addSuffix: true })}
          </p>
        </div>
        <p className='font-light'>{comment.text}</p>
      </div>
    </div>
  );
}

export function SingleTaskDialog({
  task,
  children,
}: {
  task: TaskDTO;
  children: React.ReactNode;
}) {
  const { data: userData } = useGetPersonalDetailsQuery();
  const { data, isLoading } = useGetTaskByIdQuery({ taskId: task.taskId });
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const handleDelete = async () => {
    try {
      await deleteTask({ taskId: task.taskId }).unwrap();
    } catch (error: any) {
      console.error(error.data.message);
      toast.error(error.data.message);
    }
  };

  const handleUpdate = async ({
    title,
    description,
  }: {
    title?: string;
    description?: string;
  }) => {
    try {
      await updateTask({ taskId: task.taskId, title, description }).unwrap();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data.message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className='flex w-full cursor-pointer flex-row'>
        {children}
      </DialogTrigger>
      <DialogContent
        onContextMenu={(e) => e.stopPropagation()}
        className='flex h-[60vh] min-w-4xl flex-col'
      >
        <div className='flex h-full min-h-0 flex-row'>
          <div className='flex min-h-0 w-full flex-col gap-2'>
            {/* Header */}
            <div className='flex flex-col'>
              {/* <h1 className='text-xl'>{data?.data.title}</h1> */}
              <InlineTextEdit
                value={data?.data.title as string}
                onSave={(value) => handleUpdate({ title: value })}
                className='text-xl mr-4 mb-1'
              />
              <InlineTextEdit
                value={data?.data.description || 'No Description'}
                onSave={(value) => handleUpdate({ description: value })}
                className='mr-4 text-muted-foreground'
              />
            </div>
            <Separator className='my-1' />
            {/* Comments */}
            <div className='flex h-full min-h-0 flex-1 flex-col pe-4'>
              <h1 className=''>Comments ({data?.data.comments.length})</h1>
              {data?.data.comments && data?.data.comments.length > 0 && (
                <div className='my-4 flex max-h-full scrollbar-none flex-col gap-6 overflow-y-scroll'>
                  {data?.data.comments.map((comment) => (
                    <TaskComment
                      comment={comment}
                      key={comment.taskCommentId}
                    />
                  ))}
                </div>
              )}
              {!data?.data.comments && <p>No comments</p>}
              <div className='mt-2 flex flex-row items-center gap-4 px-1'>
                <Avatar>
                  <AvatarImage src={userData?.data.image} />
                  <AvatarFallback>
                    {userData?.data.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <input
                  placeholder='Say something... (WIP)'
                  disabled
                  className='placeholder:text-muted-foreground w-full rounded-full border px-3 py-1.5 text-sm focus:outline-none'
                />
              </div>
            </div>
          </div>
          <Separator orientation='vertical' />
          <div className='ml-3 flex w-1/3 flex-col justify-between px-2 text-sm'>
            <div className='flex flex-col gap-4'>
              {/* Assignee */}
              <div className='flex flex-col gap-2'>
                <p className='text-muted-foreground font-mono'>Assigned to</p>
                {/* TODO: Interactive user card */}
                <AssignTaskPopover task={task}>
                  <div className='flex flex-row items-center gap-2'>
                    <Avatar className='size-8'>
                      <AvatarImage src={data?.data.assignee?.image} />
                      <AvatarFallback>
                        {data?.data.assignee?.name.charAt(0) || (
                          <User2 className='size-5' />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col text-left'>
                      {data?.data.assignee?.name ? (
                        <>
                          <p>{data?.data.assignee?.name}</p>
                          <p className='text-muted-foreground text-xs'>
                            {data?.data.assignee?.userProfile?.ichat}
                          </p>
                        </>
                      ) : (
                        'Unassigned'
                      )}
                    </div>
                  </div>
                </AssignTaskPopover>
              </div>
              {/* Status */}
              <div className='flex flex-col gap-1'>
                <p className='text-muted-foreground font-mono'>Status</p>
                <StatusPopover taskId={task.taskId} status={task.status}>
                  <p
                    className={cn(
                      'hover:bg-muted flex flex-row items-center gap-2 rounded-md px-1.5 py-1',
                      data?.data.status === TaskStatusEnum.NOT_STARTED &&
                        'text-muted-foreground',
                      data?.data.status === TaskStatusEnum.IN_PROGRESS &&
                        'text-blue-400',
                      data?.data.status === TaskStatusEnum.COMPLETED &&
                        'text-green-400',
                    )}
                  >
                    {data?.data.status === TaskStatusEnum.NOT_STARTED && (
                      <CircleDashed className='size-4' />
                    )}
                    {data?.data.status === TaskStatusEnum.IN_PROGRESS && (
                      <Circle className='size-4' />
                    )}
                    {data?.data.status === TaskStatusEnum.COMPLETED && (
                      <CheckCircle className='size-4' />
                    )}

                    {data?.data.status}
                  </p>
                </StatusPopover>
              </div>
              {/* Priority */}
              <div className='flex flex-col gap-1'>
                <p className='text-muted-foreground font-mono'>Priority</p>
                <p
                  className={cn(
                    'flex flex-row items-center gap-2',
                    data?.data.priority === TaskPriorityEnum.HIGH &&
                      'text-red-400',
                    data?.data.priority === TaskPriorityEnum.MEDIUM &&
                      'text-yellow-400',
                    data?.data.priority === TaskPriorityEnum.LOW &&
                      'text-green-400',
                  )}
                >
                  <Flag className='size-4' />
                  {data?.data.priority}
                </p>
              </div>
              {/* Department */}
              <div className='flex flex-col gap-1'>
                <p className='text-muted-foreground font-mono'>Department</p>
                {data?.data.department ? (
                  <Badge variant={'secondary'} className='font-normal'>
                    {data?.data.department.name}
                  </Badge>
                ) : (
                  <p>No department</p>
                )}
              </div>
              {/* Deadline */}
              <div className='flex flex-col gap-1'>
                <p className='text-muted-foreground flex flex-row items-center justify-between font-mono'>
                  Deadline
                </p>
                <DeadlinePopover
                  taskId={task.taskId}
                  deadline={task.deadline ?? undefined}
                >
                  <div className='hover:bg-muted cursor-pointer rounded-md px-1.5 py-1 text-left'>
                    {data?.data.deadline ? (
                      <p>{format(data?.data.deadline, 'dd MMM yyyy')}</p>
                    ) : (
                      <p className='text-muted-foreground flex flex-row items-center gap-2'>
                        <Plus className='size-4' /> Set deadline...
                      </p>
                    )}
                  </div>
                </DeadlinePopover>
              </div>
            </div>
            {/* Footer */}
            <div className='mb-4 flex flex-col gap-3'>
              <div className='text-muted-foreground font-mono text-xs'>
                <p>
                  Last edited{' '}
                  {data?.data &&
                    format(data?.data.updatedAt, 'dd/MM/yyyy hh:mm a')}
                </p>
                <p>
                  Created at{' '}
                  {data?.data &&
                    format(data?.data.createdAt, 'dd/MM/yyyy hh:mm a')}{' '}
                  by {data?.data.creator?.name}
                </p>
              </div>
              <Button
                variant={'ghost'}
                size={'sm'}
                onClick={() => handleDelete()}
                className='w-fit text-red-400 hover:text-red-400'
              >
                <Trash2 /> Delete task
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
