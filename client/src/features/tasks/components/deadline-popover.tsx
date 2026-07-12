import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import { useUpdateTaskMutation } from '../state/tasks-api-slice';
import { toast } from 'sonner';

export function DeadlinePopover({
  children,
  taskId,
  deadline,
}: {
  children: React.ReactNode;
  taskId: string;
  deadline: Date | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [updateTask] = useUpdateTaskMutation();

  const handleUpdate = async (value: Date | undefined) => {
    if (!value) return;

    try {
      await updateTask({ taskId, deadline: value }).unwrap();
      toast.success('Successfully updated deadline.');
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
      <PopoverContent className='w-auto p-0' align='end'>
        <Calendar
          mode='single'
          selected={deadline}
          onSelect={(value) => handleUpdate(value)}
          defaultMonth={deadline}
        />
      </PopoverContent>
    </Popover>
  );
}
