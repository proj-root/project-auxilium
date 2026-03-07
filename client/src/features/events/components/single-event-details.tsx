import { Building, Clock, List, SquareArrowOutUpRight } from 'lucide-react';
import type { Event } from '../events.dto';
import { format, isEqual, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function EventDetailsCard({
  event,
  className,
}: {
  event: Event;
  className?: string;
}) {
  const isSameDay = isEqual(
    startOfDay(new Date(event.startDate)),
    startOfDay(new Date(event.endDate)),
  );

  return (
    <div
      className={cn(
        'bg-card flex flex-col gap-2 rounded-md border px-4 py-3',
        className,
      )}
    >
      <div className='flex flex-row items-center gap-2 text-sm'>
        <p className='flex w-full flex-row items-center gap-2'>
          <Clock className='size-4' />
          Event Duration
        </p>
        <p className='w-full'>
          {event.startDate && event.endDate ? (
            <p>
              {isSameDay
                ? `${format(event.startDate, 'do MMM yyyy')}, ${format(event.startDate, 'hh:mm a')} - ${format(event.endDate, 'hh:mm a')}`
                : `${format(event.startDate, 'do MMM yyyy')} to ${format(event.endDate, 'do MMM yyyy')}`}
            </p>
          ) : (
            <p className='text-muted-foreground'>No date information yet</p>
          )}
        </p>
      </div>
      <div className='flex flex-row items-center gap-2 text-sm'>
        <p className='flex w-full flex-row items-center gap-2'>
          <List className='size-4' />
          Event Type
        </p>
        <p className='w-full'>{event.eventType.name}</p>
      </div>
      <div className='flex flex-row items-center gap-2 text-sm'>
        <p className='flex w-full flex-row items-center gap-2'>
          <Building className='size-4' />
          Platform
        </p>
        <p className={cn('w-full', !event.platform && 'text-muted-foreground')}>
          {event.platform ?? 'Not Specified'}
        </p>
      </div>
      <Separator />
      <div className='flex flex-row gap-2 items-center'>
        <Button variant={'outline'} size={'xs'}>
          <Link
            to={event.signupUrl}
            target='_blank'
            className='flex flex-row items-center gap-2'
          >
            <SquareArrowOutUpRight /> Signup Responses
          </Link>
        </Button>
        <Button variant={'outline'} size={'xs'}>
          <Link
            to={event.signupUrl}
            target='_blank'
            className='flex flex-row items-center gap-2'
          >
            <SquareArrowOutUpRight /> Feedback Responses
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function EventHelpersCard() {
  // TODO: Create list of helpers for each event
}
