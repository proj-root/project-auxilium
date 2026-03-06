import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import type { Event } from '../events.dto';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

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
        <ContextMenuItem>Profile</ContextMenuItem>
        <ContextMenuItem>Billing</ContextMenuItem>
        <ContextMenuItem>Team</ContextMenuItem>
        <ContextMenuItem>Subscription</ContextMenuItem>
        <Separator className='my-1'/>
        {/* TODO: Include tooltip with user profile info */}
        <div className='text-muted-foreground px-2 py-1 text-xs'>
          <p>Last edited by {event.creator.email}</p>
          <p>{format(event.createdAt, 'MMM do yyyy, hh:mm a')}</p>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}
