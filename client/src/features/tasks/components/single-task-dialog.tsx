import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGetTaskByIdQuery } from '../state/tasks-api-slice';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Flag, Plus, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskPriorityEnum, type TaskCommentDTO } from '../tasks.dto';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
  useGetPersonalDetailsQuery,
  useGetSingleUserQuery,
} from '@/features/user/state/user-api-slice';
import { authClient } from '@/lib/auth-client';

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
  taskId,
  children,
}: {
  taskId: string;
  children: React.ReactNode;
}) {
  const { data: userData } = useGetPersonalDetailsQuery();
  const { data, isLoading } = useGetTaskByIdQuery({ taskId });

  return (
    <Dialog>
      <DialogTrigger className='cursor-pointer' asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='flex h-[60vh] min-w-4xl flex-col'>
        <div className='flex h-full flex-row'>
          <div className='flex w-full flex-col gap-2'>
            {/* Header */}
            <div className='flex flex-col'>
              <h1 className='text-xl'>{data?.data.title}</h1>
              <p className='text-muted-foreground'>
                {data?.data.description || 'No Description'}
              </p>
            </div>
            <Separator className='my-1' />
            {/* Comments */}
            <div className='pe-4'>
              <h1 className=''>Comments</h1>
              {data?.data.comments && data?.data.comments.length > 0 && (
                <div className='my-4 flex flex-col gap-2 overflow-y-auto scrollbar-none'>
                  {data?.data.comments.map((comment) => (
                    <TaskComment
                      comment={comment}
                      key={comment.taskCommentId}
                    />
                  ))}
                </div>
              )}
              {!data?.data.comments && <p>No comments</p>}
              <div className='flex flex-row items-center gap-4 px-1'>
                <Avatar>
                  <AvatarImage src={userData?.data.image} />
                  <AvatarFallback>
                    {userData?.data.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <input
                  placeholder='Comment'
                  className='w-full placeholder:text-muted-foreground text-sm rounded-full border px-3 py-1.5 focus:outline-none'
                />
              </div>
            </div>
          </div>
          <Separator orientation='vertical' />
          <div className='ml-3 flex w-1/3 flex-col gap-4 px-2 text-sm'>
            {/* Assignee */}
            <div className='flex flex-col gap-2'>
              <p className='text-muted-foreground'>Assigned to</p>
              {/* TODO: Interactive user card */}
              <div className='flex flex-row items-center gap-2'>
                <Avatar className='size-8'>
                  <AvatarImage src={data?.data.assignee?.image} />
                  <AvatarFallback>
                    {data?.data.assignee?.name.charAt(0) || (
                      <User2 className='size-5' />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
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
            </div>
            {/* Priority */}
            <div className='flex flex-col gap-1'>
              <p className='text-muted-foreground'>Priority</p>
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
              <p className='text-muted-foreground'>Department</p>
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
              <p className='text-muted-foreground flex flex-row items-center justify-between'>
                Deadline
              </p>
              {data?.data.deadline ? (
                <p>{format(data?.data.deadline, 'dd MMM yyyy')}</p>
              ) : (
                <button className='text-muted-foreground hover:bg-muted flex cursor-pointer flex-row items-center gap-2 rounded-md p-1 text-left'>
                  <Plus className='size-4' /> Set deadline...
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
