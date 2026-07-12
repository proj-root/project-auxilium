import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import type { Event } from '../events.dto';
import { format } from 'date-fns';
import { Link } from 'react-router';
import { ArrowUpRight, Copy, Trash2 } from 'lucide-react';
import type { DataTableContextMenuProps } from '@/components/ui/data-table';
import { copyToClipboard } from '@/lib/clipboard';
import { DeleteEventDialog } from './delete-event-dialog';
import { useState } from 'react';

export function EventItemContextMenu({
  row,
  trigger,
  className,
}: DataTableContextMenuProps<Omit<Event, 'eventReport'>>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger className={cn('', className)}>
        {trigger}
      </ContextMenuTrigger>
      <ContextMenuContent className='w-72'>
        <h1 className='text-semibold text-muted-foreground px-2 py-1 text-xs'>
          {row.name}
        </h1>
        <ContextMenuItem className='cursor-pointer' asChild>
          <Link
            to={`/admin/events/${row.eventId}`}
            className='text-foreground flex flex-row gap-1'
          >
            <ArrowUpRight /> View Event
          </Link>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => copyToClipboard(row.eventId)}
          className='cursor-pointer gap-2'
        >
          <Copy /> Copy ID
        </ContextMenuItem>

        <ContextMenuItem
          className='cursor-pointer gap-2'
          onClick={() => setIsDeleteDialogOpen(true)}
          variant={'destructive'}
        >
          <Trash2 /> Move to Trash
        </ContextMenuItem>
        <ContextMenuSeparator className='my-1' />
        {/* TODO: Include tooltip with user profile info */}
        <div className='text-muted-foreground px-2 py-1 text-xs font-mono'>
          <p>Last edited by {row.creator.email} on {format(row.updatedAt, 'MMM do yyyy, hh:mm a')}</p>
          <p>Created on {format(row.createdAt, 'MMM do yyyy, hh:mm a')}</p>
        </div>
      </ContextMenuContent>

      <DeleteEventDialog
        eventId={row.eventId}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </ContextMenu>
  );
}
