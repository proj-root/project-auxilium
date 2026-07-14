import { Button } from '@/components/ui/button';
import { DeleteEventDialog, HardDeleteEventDialog } from './delete-event-dialog';

export function EventSettings({ eventId }: { eventId: string }) {

  return (
    <div className='w-1/2 flex flex-col gap-4'>
      <h1 className='text-2xl'>Danger Zone</h1>
      <div className='border-destructive/50 rounded-xl border'>
        <div className='flex flex-row justify-between p-4 items-center'>
          <div>
            <h1 className='font-medium'>Move this event to trash</h1>
            <p className='font-light'>Archives the event. It can be unarchived in the future.</p>
          </div>
          <DeleteEventDialog eventId={eventId}>
            <Button variant={'destructive'} size={'sm'}>Archive this event</Button>
          </DeleteEventDialog>
        </div>
        <div className='flex flex-row justify-between p-4 items-center'>
          <div>
            <h1 className='font-medium'>Delete this event</h1>
            <p className='font-light'>
              Permanently deletes this event. There is no going back. Please be
              certain.
            </p>
          </div>
          <HardDeleteEventDialog eventId={eventId}>
            <Button variant={'destructive'} size={'sm'}>Delete this event</Button>
          </HardDeleteEventDialog>
        </div>
      </div>
    </div>
  );
}
