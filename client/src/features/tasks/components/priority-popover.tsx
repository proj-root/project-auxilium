import { useState } from "react";
import { TaskPriorityEnum } from "../tasks.dto";
import { useUpdateTaskMutation } from "../state/tasks-api-slice";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check, Flag } from "lucide-react";

export function PriorityPopover({
  taskId,
  priority,
  children,
}: {
  taskId: string;
  priority: TaskPriorityEnum;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [updateTask] = useUpdateTaskMutation();

  const handleUpdate = async (value: TaskPriorityEnum) => {
    if (priority === value) return;
    try {
      await updateTask({ taskId, priority: value }).unwrap();
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
          {Object.entries(TaskPriorityEnum).map(([_, value]) => {
            return (
              <li
                onClick={() => handleUpdate(value)}
                className={cn(
                  'hover:bg-muted flex w-full flex-row items-center justify-between rounded-md px-1.5 py-1',
                  priority !== value && 'cursor-pointer',
                )}
              >
                <p
                  className={cn(
                    'flex flex-row items-center gap-2',
                    value === TaskPriorityEnum.HIGH &&
                      'text-red-400',
                    value === TaskPriorityEnum.MEDIUM &&
                      'text-yellow-400',
                    value === TaskPriorityEnum.LOW &&
                      'text-green-400',
                  )}
                >
                  <Flag className="size-4"/> {value}
                </p>
                {priority === value && (
                  <Check className='text-muted-foreground size-4' />
                )}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}