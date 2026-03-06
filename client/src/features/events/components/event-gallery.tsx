import { useGetAllEventsQuery } from '../state/events-api-slice';
import type { Event } from '../events.dto';
import { Building, Clock, PanelRight } from 'lucide-react';
import { format, isEqual, startOfDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';

import { EventItemContextMenu } from './event-context-menu';
import { EventItemDrawer } from './event-drawer-component';
import { Button } from '@/components/ui/button';

// TODO: Turn intoo clickable component that opens sidebar
function EventGalleryItem({ event }: { event: Omit<Event, 'eventReports'> }) {
  const isSameDay = isEqual(
    startOfDay(new Date(event.startDate)),
    startOfDay(new Date(event.endDate)),
  );

  return (
    <div className='bg-card hover:bg-accent/40 rounded-md border px-4 py-3 w-full'>
      <EventItemContextMenu event={event} className='flex flex-col gap-2'>
        {/* Header */}
        <div className='flex flex-row items-start justify-between'>
          <div>
            <h1 className='text-xl font-semibold'>{event.name}</h1>
            <p className='text-muted-foreground text-sm'>{event.description}</p>
          </div>
          <div className='flex flex-row items-center gap-2'>
            <Badge className='bg-accent text-accent-foreground'>
              {event.eventType.name}
            </Badge>
            <EventItemDrawer event={event}>
              <PanelRight className='size-4' />
            </EventItemDrawer>
          </div>
        </div>
        {/* Date */}
        <div className='flex flex-row items-center gap-2 text-sm'>
          <Clock className='size-4' />
          {event.startDate && event.endDate ? (
            <p>
              {isSameDay
                ? `${format(event.startDate, 'do MMMM yyyy')}, ${format(event.startDate, 'hh:mm a')} - ${format(event.endDate, 'hh:mm a')}`
                : `${format(event.startDate, 'do MMMM yyyy')} to ${format(event.endDate, 'do MMMM yyyy')}`}
            </p>
          ) : (
            <p className='text-muted-foreground'>No date information yet</p>
          )}
        </div>
        {event.platform && (
          <div className='flex flex-row items-center gap-2 text-sm'>
            <Building className='size-4' />
            <p>{event.platform}</p>
          </div>
        )}
      </EventItemContextMenu>
    </div>
  );
}

export function EventsGalleryView() {
  const { data } = useGetAllEventsQuery({});

  return (
    <div className='flex flex-row flex-wrap gap-y-4'>
      {data &&
        data.data.map((event) => (
          <div className='flex w-1/4 pe-4'>
            <EventGalleryItem event={event} />
          </div>
        ))}
    </div>
  );
}
