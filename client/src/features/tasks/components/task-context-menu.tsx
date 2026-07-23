import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import type { TaskDTO } from '../tasks.dto';
import { useDeleteTaskMutation } from '../state/tasks-api-slice';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function TaskContextMenu({
  task,
  children,
}: {
  task: TaskDTO;
  children: React.ReactNode;
}) {
  const [deleteTask] = useDeleteTaskMutation();

  const handleDelete = async () => {
    try {
      await deleteTask({ taskId: task.taskId }).unwrap();
    } catch (error: any) {
      console.error(error.data.message);
      toast.error(error.data.message);
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className='w-full'>{children}</ContextMenuTrigger>
      <ContextMenuContent className='min-w-50'>
        <ContextMenuItem variant='destructive' onClick={() => handleDelete()}>
          <Trash2 /> Delete task
        </ContextMenuItem>
        <ContextMenuSeparator className='my-1' />
        {/* TODO: Include tooltip with user profile info */}
        <div className='text-muted-foreground px-2 py-1 text-xs'>
          {/* TODO: Make name into link to public profile next time */}
          <p>Last edited by {task.creator?.name}</p>
          <p>{format(task.createdAt, 'do MMM yyyy, hh:mm a')}</p>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}
