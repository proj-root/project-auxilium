import { useGetAllEventsQuery } from '../state/events-api-slice';
import type { Event } from '../events.dto';

function EventGalleryItem({ event }: { event: Omit<Event, 'eventReports'> }) {
  return (
    <div className='bg-card flex w-full flex-col rounded-md border px-4 py-3'>
      <h1 className='text-xl font-semibold'>{event.name}</h1>
      <p className='text-sm text-muted-foreground'>{event.description}</p>
      <div>
        {/* Dates here */}
      </div>
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
