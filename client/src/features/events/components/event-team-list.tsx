import { ComingSoonEmpty } from '@/components/misc/empty-screen';
import { cn } from '@/lib/utils';
import type { Event, UserEventRole } from '../events.dto';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

function SingleTeamMember({ userEventRole }: { userEventRole: UserEventRole }) {
  return (
    <div className='hover:bg-muted/80 flex items-center justify-between rounded-md px-2 py-1'>
      {/* Profile */}
      <div className='flex items-center gap-4'>
        <Avatar className='size-8'>
          <AvatarImage src={userEventRole.user.image} />
          <AvatarFallback className='border'>
            {userEventRole.user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className='flex max-w-48 flex-col'>
          <h1 className='truncate font-medium'>{userEventRole.user.name}</h1>
          <p className='text-muted-foreground truncate text-sm'>
            {userEventRole.user.userProfile.ichat}
          </p>
        </div>
      </div>
      {/* Event Role */}
      <h1>{userEventRole.eventRole.name}</h1>
    </div>
  );
}

export function EventTeamList({
  event,
  className,
}: {
  event: Event;
  className?: string;
}) {
  return (
    <div className={cn('h-100 max-h-100 w-full', className)}>
      <h1 className='mt-1 mb-4 text-xl font-medium'>Organising Team</h1>
      <div className='flex max-h-full scrollbar-none flex-col gap-2 overflow-y-auto'>
        {event && event.userEventRoles.length !== 0 && (
          <div className='flex h-full w-full items-center justify-center self-center rounded-xl border border-dashed py-10'>
            <p className='text-muted-foreground'>No members added... yet.</p>
          </div>
        )}
        {/* {event &&
          event.userEventRoles.length > 0 &&
          event.userEventRoles.map((uer) => (
            <>
            <SingleTeamMember userEventRole={uer} key={uer.user.id} />
            </>
          ))} */}
      </div>
      {/* <Separator className='my-2'/>
      <p className='text-xs text-muted-foreground font-mono'>Total members: {event.userEventRoles.length}</p> */}
    </div>
  );
}
