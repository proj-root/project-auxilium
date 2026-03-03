import { CreateEventForm } from '@/features/events/components/create-event-form';

export default function CreateEventPage() {
  return (
    <div className='flex flex-col'>
      <div className='flex flex-col mb-4'>
        <h1 className='text-3xl font-semibold'>Create New Event</h1>
        <p className='text-muted-foreground'>
          Set up a new or planned event here
        </p>
      </div>
      <CreateEventForm className='max-w-md md:max-w-full' />
    </div>
  );
}
