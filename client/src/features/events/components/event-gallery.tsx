import { useGetAllEventsQuery } from '../state/events-api-slice';
import type { Event } from '../events.dto';
import { Building, Clock, Maximize2, PanelRight } from 'lucide-react';
import { format, isEqual, startOfDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';

import { EventItemContextMenu } from './event-context-menu';
import { EventItemDrawer } from './event-drawer-component';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';

// TODO: Turn intoo clickable component that opens sidebar
function EventGalleryItem({ event }: { event: Omit<Event, 'eventReport'> }) {
  const [isHovered, setIsHovered] = useState(false);

  const isSameDay =
    event.startDate && event.endDate
      ? isEqual(
          startOfDay(new Date(event.startDate)),
          startOfDay(new Date(event.endDate)),
        )
      : false;

  return (
    <div
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onBlur={() => setIsHovered(false)}
      className='bg-card hover:bg-accent/40 w-full rounded-md border px-4 py-3'
    >
      {/* TODO: This might genuinely be the worst form of callback hell i've ever seen */}
      <EventItemContextMenu
        trigger={
          <>
            {/* Header */}
            <div className='flex flex-row items-start justify-between'>
              <div>
                <h1 className='text-xl font-semibold'>{event.name}</h1>
                <p className='text-muted-foreground text-sm'>
                  {event.description}
                </p>
              </div>
              <div
                className={cn(
                  'flex flex-row items-center',
                  'opacity-0 transition-opacity duration-200 ease-in-out',
                  isHovered && 'opacity-100',
                )}
              >
                {/* <EventItemDrawer event={event}>
                  <Button
                    variant={'ghost'}
                    size={'icon-sm'}
                    className='size-7'
                    title='Side peek'
                  >
                    <PanelRight className='' />
                  </Button>
                </EventItemDrawer> */}
                <Button
                  variant={'ghost'}
                  size={'icon-sm'}
                  className='size-7'
                  title='Full view'
                  asChild
                >
                  <Link to={`/admin/events/${event.eventId}`}>
                    <Maximize2 />
                  </Link>
                </Button>
              </div>
            </div>
            {/* Date */}
            <div className='flex flex-row items-center gap-2 text-sm'>
              <Clock className='size-4' />
              {event.startDate && event.endDate ? (
                <p>
                  {isSameDay
                    ? `${format(event.startDate, 'do MMM yyyy')}, ${format(event.startDate, 'hh:mm a')} - ${format(event.endDate, 'hh:mm a')}`
                    : `${format(event.startDate, 'do MMM yyyy')} to ${format(event.endDate, 'do MMM yyyy')}`}
                </p>
              ) : (
                <p className='text-muted-foreground'>No date information yet</p>
              )}
            </div>
            {/* TODO: Colour badges */}
            <div className='flex flex-row gap-2 py-1'>
              <Badge className='bg-accent text-accent-foreground'>
                {event.eventType.name}
              </Badge>
              {event.platform ? (
                <Badge variant={'secondary'}>{event.platform}</Badge>
              ) : (
                <Badge
                  variant={'outline'}
                  className='text-muted-foreground outline-1 outline-dashed'
                >
                  No platform
                </Badge>
              )}
            </div>
          </>
        }
        row={event}
        className='flex flex-col gap-2'
      ></EventItemContextMenu>
    </div>
  );
}

export function EventsGalleryView() {
  const { data } = useGetAllEventsQuery({});

  return (
    <div className='flex flex-row flex-wrap gap-y-4'>
      {data &&
        data.data.events.map((event) => (
          <div
            className='flex w-full pe-4 lg:w-1/2 xl:w-1/4'
            key={event.eventId}
          >
            <EventGalleryItem event={event} />
          </div>
        ))}
    </div>
  );
}
