import { useState, useMemo } from 'react';
import { useGetAllEventsQuery } from '../state/events-api-slice';
import type { Event } from '../events.dto';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  addWeeks,
  isSameDay,
  isSameMonth,
  setHours,
  setMinutes,
  parseISO,
  getHours,
} from 'date-fns';
import { Button } from '@/components/ui/button';

// Developer-configurable week view time range
const WEEK_START_HOUR = 8;
const WEEK_END_HOUR = 20;
const HOURS = Array.from(
  { length: WEEK_END_HOUR - WEEK_START_HOUR + 1 },
  (_, i) => WEEK_START_HOUR + i,
);

// TODO: Don't do filtering on frontend?
function getEventsForHour(
  events: Omit<Event, 'eventReports'>[],
  day: Date,
  hour: number,
) {
  return events.filter((event) => {
    const start = parseISO(event.startDate);
    return isSameDay(start, day) && getHours(start) === hour;
  });
}

export type CalendarView = 'month' | 'week';

export function EventsCalendarView() {
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate query params for backend filtering
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { data, isLoading, isError } = useGetAllEventsQuery({ month, year });
  const allEvents = data?.data || [];

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // For week view, filter events to only those in the current week (after backend month filter)
  // TODO: Make a filter for weeks as well
  const weekEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const start = parseISO(event.startDate);
      return weekDays.some((day) => isSameDay(start, day));
    });
  }, [allEvents, weekDays]);

  // Display string for current month and year
  const monthYearLabel = format(currentDate, 'MMMM yyyy');

  // Month view grid
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Navigation handlers
  // If month view, adjust by 4 weeks (1 month)
  // If week view, adjust by 7 days (1 week)
  const goToPrev = () => {
    setCurrentDate(
      view === 'month' ? addWeeks(currentDate, -4) : addDays(currentDate, -7),
    );
  };
  const goToNext = () => {
    setCurrentDate(
      view === 'month' ? addWeeks(currentDate, 4) : addDays(currentDate, 7),
    );
  };
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className='h-full w-full'>
      {/* Controls */}
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex gap-2'>
          <Button onClick={goToPrev} variant={'outline'} size={'xs'}>
            Prev
          </Button>
          <Button onClick={goToToday} size={'xs'}>
            Today
          </Button>
          <Button onClick={goToNext} variant={'outline'} size={'xs'}>
            Next
          </Button>
        </div>
        {/* Month/Year Label */}
        <span className='text-lg font-semibold tracking-wide'>
          {monthYearLabel}
        </span>
        <div className='flex gap-2'>
          <Button
            onClick={() => setView('month')}
            variant={view === 'month' ? 'default' : 'outline'}
            size={'sm'}
          >
            Month
          </Button>
          <Button
            onClick={() => setView('week')}
            variant={view === 'week' ? 'default' : 'outline'}
            size={'sm'}
          >
            Week
          </Button>
        </div>
      </div>

      {/* Loading/Error */}
      {isLoading && <div>Loading events...</div>}
      {isError && <div className='text-red-500'>Failed to load events.</div>}

      {/* Calendar Grid */}
      <div className='h-[80vh] overflow-y-scroll'>
        {view === 'month' ? (
          <div className='bg-border grid grid-cols-7 gap-px overflow-hidden rounded-lg'>
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className='bg-muted py-2 text-center text-xs font-semibold uppercase'
              >
                {d}
              </div>
            ))}
            {/* Days */}
            {monthDays.map((day, idx) => {
              const dayEvents = allEvents.filter((event) =>
                isSameDay(parseISO(event.startDate), day),
              );
              return (
                <div
                  key={idx}
                  className={cn(
                    'border-border bg-background flex min-h-[100px] flex-col gap-1 border p-2',
                    !isSameMonth(day, currentDate) &&
                      'bg-muted/50 text-muted-foreground',
                    isSameDay(day, new Date()) && 'ring-primary ring-2',
                  )}
                >
                  <div className='mb-1 text-xs font-bold'>
                    {format(day, 'd')}
                  </div>
                  <div className='flex flex-col gap-1'>
                    {dayEvents.map((event) => (
                      <Card key={event.eventId} className='bg-accent/60 p-2'>
                        <div className='flex items-center gap-2'>
                          <span className='truncate text-xs font-medium'>
                            {event.name}
                          </span>
                          <Badge className='ml-auto' variant='secondary'>
                            {event.eventType.name}
                          </Badge>
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          {format(parseISO(event.startDate), 'MMM d, h:mm a')} -{' '}
                          {format(parseISO(event.endDate), 'h:mm a')}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='bg-border grid grid-cols-8 gap-px rounded-lg'>
            {/* Time column header */}
            <div className='bg-muted'></div>
            {/* Day headers */}
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className='bg-muted py-2 text-center text-xs font-semibold uppercase'
              >
                {format(day, 'EEE d')}
              </div>
            ))}
            {/* Time rows */}
            {HOURS.map((hour) => (
              <>
                {/* Time label */}
                <div
                  key={`label-${hour}`}
                  className='bg-muted py-4 pr-2 text-right align-top text-xs font-semibold'
                >
                  {format(setHours(setMinutes(new Date(), 0), hour), 'h a')}
                </div>
                {/* Event cells for each day */}
                {weekDays.map((day) => {
                  const hourEvents = getEventsForHour(weekEvents, day, hour);
                  return (
                    <div
                      key={day.toISOString() + hour}
                      className='border-border bg-background flex min-h-[60px] flex-col gap-1 border p-1'
                    >
                      {hourEvents.map((event) => (
                        <Card key={event.eventId} className='bg-accent/60 p-2'>
                          <div className='flex items-center gap-2'>
                            <span className='truncate text-xs font-medium'>
                              {event.name}
                            </span>
                            <Badge className='ml-auto' variant='secondary'>
                              {event.eventType.name}
                            </Badge>
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {format(parseISO(event.startDate), 'h:mm a')} -{' '}
                            {format(parseISO(event.endDate), 'h:mm a')}
                          </div>
                        </Card>
                      ))}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
