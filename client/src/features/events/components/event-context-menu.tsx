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
import { ArrowUpRight } from 'lucide-react';

export function EventItemContextMenu({
  children,
  className,
  event,
}: {
  children: React.ReactNode;
  className?: string;
  event: Omit<Event, 'eventReports'>;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className={cn('', className)}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className='w-64'>
        <h1 className='text-semibold text-muted-foreground text-xs px-2 py-1'>Menu</h1>
        <ContextMenuItem className='cursor-pointer' asChild>
          <Link to={`/admin/events/${event.eventId}`} className='flex-row flex gap-1 text-foreground'>
            <ArrowUpRight className='size-5 text-foreground'/> View Event
          </Link>
        </ContextMenuItem>
        <ContextMenuSeparator className='my-1'/>
        {/* TODO: Include tooltip with user profile info */}
        <div className='text-muted-foreground px-2 py-1 text-xs'>
          <p>Last edited by {event.creator.email}</p>
          <p>{format(event.createdAt, 'MMM do yyyy, hh:mm a')}</p>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}
