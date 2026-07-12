import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import { TaskStatusEnum } from '../tasks.dto';
import { useUpdateTaskMutation } from '../state/tasks-api-slice';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusPopover({
  taskId,
  status,
  children,
}: {
  taskId: string;
  status: TaskStatusEnum;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [updateTask] = useUpdateTaskMutation();

  const handleUpdate = async (value: TaskStatusEnum) => {
    if (status === value) return;
    try {
      await updateTask({ taskId, status: value });
      if (value === TaskStatusEnum.COMPLETED) {
        toast.success('Task completed!');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.data.message);
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className='cursor-pointer'>{children}</PopoverTrigger>
      <PopoverContent className='me-4 max-w-40 px-1 py-2' align='start'>
        <ul className='flex flex-col gap-1'>
          {Object.entries(TaskStatusEnum).map(([key, value]) => {
            return (
              <li
                onClick={() => handleUpdate(value)}
                className={cn(
                  'hover:bg-muted flex w-full flex-row items-center justify-between rounded-md px-1.5 py-1',
                  status !== value && 'cursor-pointer',
                )}
              >
                <Badge
                  variant={'outline'}
                  className={cn(
                    value === TaskStatusEnum.NOT_STARTED &&
                      'text-muted-foreground',
                    value === TaskStatusEnum.IN_PROGRESS &&
                      'border-blue-400 text-blue-400',
                    value === TaskStatusEnum.COMPLETED &&
                      'border-green-400 text-green-400',
                  )}
                >
                  {value}
                </Badge>
                {status === value && (
                  <Check className='text-muted-foreground size-4' />
                )}
              </li>
            );
          })}

          {/* <li
            onClick={() => handleUpdate(TaskStatusEnum.IN_PROGRESS)}
            className='hover:bg-muted w-full cursor-pointer rounded-md px-1.5 py-0.5'
          >
            <Badge
              variant={'outline'}
              className='border-blue-400 text-blue-400'
            >
              In progress
            </Badge>
          </li>
          <li
            onClick={() => handleUpdate(TaskStatusEnum.COMPLETED)}
            className='hover:bg-muted w-full cursor-pointer rounded-md px-1.5 py-0.5'
          >
            <Badge
              variant={'outline'}
              className='border-green-400 text-green-400'
            >
              Completed
            </Badge>
          </li> */}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
