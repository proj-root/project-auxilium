import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useGetAllUsersQuery } from '@/features/user/state/user-api-slice';
import type { UserDTO } from '@/features/user/user.dto';
import { cn } from '@/lib/utils';
import { RolesConfig } from '@auxilium/configs/roles';
import { Search, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useUpdateTaskMutation } from '../state/tasks-api-slice';
import { toast } from 'sonner';
import type { TaskDTO } from '../tasks.dto';
import { Button } from '@/components/ui/button';

function UserSearchItem({ user }: { user: UserDTO }) {
  return (
    <div
      className={cn(
        'hover:bg-muted flex w-full flex-row items-center justify-between gap-4 rounded-md p-2',
      )}
    >
      <Avatar className='size-6 outline'>
        <AvatarImage src={user.image} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className='flex w-full flex-row justify-between gap-2'>
        <p className={cn('flex flex-row items-baseline gap-1')}>{user.name} </p>
        <Badge variant={'secondary'}>{user.departments[0]?.name || 'NA'}</Badge>
      </div>
    </div>
  );
}

export function AssignTaskPopover({
  task,
  children,
}: {
  task: TaskDTO;
  children: React.ReactNode;
}) {
  const [updateTask] = useUpdateTaskMutation();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // TODO: Should only be able to search users within event
  const {
    data: userSearchData,
    isLoading,
    isError,
  } = useGetAllUsersQuery({
    roleIds: [RolesConfig.ADMIN, RolesConfig.SUPERADMIN],
    search: inputValue,
  });

  const handleAssign = async ({ userId }: { userId: string }) => {
    try {
      await updateTask({ taskId: task.taskId, assigneeId: userId }).unwrap();
      toast.success('Assigned task successfully');
    } catch (error: any) {
      console.error(error.data.message);
      toast.error(error.data.message);
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className='cursor-pointer'>{children}</PopoverTrigger>
      <PopoverContent align='end' className='min-w-60 p-3'>
        <div className='flex flex-col gap-2'>
          {task.assignee && (
            <div className='flex flex-row items-center gap-2 py-1.5 text-sm'>
              <Avatar className='size-5 outline'>
                <AvatarImage src={task.assignee?.image} />
                <AvatarFallback>{task.assignee?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p>{task.assignee.name}</p>
              <X
                className='size-4 cursor-pointer'
                onClick={() => handleAssign({ userId: '' })}
              />
            </div>
          )}
          <Input
            placeholder='Search...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className='h-8'
          />
          <div className='flex max-h-40 w-full scrollbar-none flex-col gap-1 overflow-y-scroll'>
            {userSearchData?.data &&
              userSearchData.data.users.map((user) => (
                <div
                  onClick={() => handleAssign({ userId: user.id })}
                  className='cursor-pointer'
                >
                  <UserSearchItem user={user} />
                </div>
              ))}
            {userSearchData?.data && userSearchData.data.users.length === 0 && (
              <div className='text-muted-foreground flex flex-row items-center justify-center rounded-md border border-dashed p-3 text-sm'>
                <h1>No users found.</h1>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
