import {
  Building,
  Clock,
  List,
  MapPin,
  SquareArrowOutUpRight,
  SquareChevronDown,
} from 'lucide-react';
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
  const isSameDay =
    event.startDate && event.endDate
      ? isEqual(
          startOfDay(new Date(event.startDate)),
          startOfDay(new Date(event.endDate)),
        )
      : false;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className='flex flex-row items-center gap-2'>
        <p className='flex w-full flex-row items-center gap-2'>
          <Clock className='size-4' />
          Event Duration
        </p>
        <div className='w-full'>
          {event.startDate && event.endDate ? (
            <p>
              {isSameDay
                ? `${format(event.startDate, 'do MMM yyyy')}, ${format(event.startDate, 'hh:mm a')} - ${format(event.endDate, 'hh:mm a')}`
                : `${format(event.startDate, 'do MMM yyyy')} to ${format(event.endDate, 'do MMM yyyy')}`}
            </p>
          ) : (
            <p className='text-muted-foreground'>-</p>
          )}
        </div>
      </div>
      <div className='flex flex-row items-center gap-2'>
        <p className='flex w-full flex-row items-center gap-2'>
          <SquareChevronDown className='size-4' />
          Event Type
        </p>
        <p className='w-full'>{event.eventType.name}</p>
      </div>
      <div className='flex flex-row items-center gap-2'>
        <p className='flex w-full flex-row items-center gap-2'>
          <Building className='size-4' />
          Platform
        </p>
        <p className={cn('w-full', !event.platform && 'text-muted-foreground')}>
          {event.platform ?? '-'}
        </p>
      </div>
      <div className='flex flex-row items-center gap-2'>
        <p className='flex w-full flex-row items-center gap-2'>
          <MapPin className='size-4' />
          Venue
        </p>
        <p className={cn('w-full', !event.venue && 'text-muted-foreground')}>
          {event.venue ?? '-'}
        </p>
      </div>
      <Separator className='my-1' />
      <div className='flex flex-row items-center gap-2'>
        <Button variant={'outline'} size={'xs'} disabled={!event.signupUrl}>
          <Link
            to={event.signupUrl ?? ''}
            target='_blank'
            className='flex flex-row items-center gap-2'
          >
            <SquareArrowOutUpRight /> Signup Responses
          </Link>
        </Button>
        <Button variant={'outline'} size={'xs'} disabled={!event.feedbackUrl}>
          <Link
            to={event.feedbackUrl ?? ''}
            target='_blank'
            className='flex flex-row items-center gap-2'
          >
            <SquareArrowOutUpRight /> Feedback Responses
          </Link>
        </Button>
      </div>
      <div className='text-muted-foreground flex flex-col gap-1 text-xs'>
        <p>
          Created on {format(event.createdAt, 'do MMM yyyy h:m a')} by{' '}
          {event.creator.email}
        </p>
      </div>
    </div>
  );
}

export function EventHelpersCard() {
  // TODO: Create list of helpers for each event
}
