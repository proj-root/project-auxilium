import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bird, Copy, UserPlus } from 'lucide-react';
import type { Event, UserEventRole } from '../events.dto';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function UserEventRoleItem({
  userEventRole,
}: {
  userEventRole: UserEventRole;
}) {
  return (
    <div className='flex flex-row items-center justify-between gap-4'>
      <Avatar className='size-8'>
        <AvatarImage src={userEventRole.user.image} />
        <AvatarFallback>{userEventRole.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className='flex w-full flex-col'>
        <p>{userEventRole.user.name}</p>
        <p className='text-muted-foreground text-sm'>
          {userEventRole.user.userProfile.ichat}
        </p>
      </div>
      {/* TODO: Dropdown to edit user event role */}
      <div className='text-nowrap'>
        <p>{userEventRole.eventRole.name}</p>
      </div>
    </div>
  );
}

export function AssignUserDialog({ event }: { event: Event }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={'ghost'} size={'icon'}>
          <UserPlus className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex flex-row items-center gap-2 text-2xl'>
            Share <UserPlus className='size-5' />
          </DialogTitle>
          <DialogDescription>
            Assign users to this event; the more the merrier!
          </DialogDescription>
        </DialogHeader>
        {/* Invitation Box */}
        <div className='flex w-full flex-col gap-4'>
          {/* TODO: Popover appears when typing */}
          <Input placeholder='Add people...' />
        </div>
        {/* Assigned Users */}
        <div className='flex flex-col'>
          <div className='mb-3 flex flex-row items-center justify-between'>
            <h1 className='text-lg'>Added Members</h1>
            {/* TODO: Copy all feature to grab all emails at once */}
            <Button variant={'ghost'} size={'icon'}>
              <Copy />
            </Button>
          </div>
          <div className='flex w-full flex-col gap-3'>
            {event.userEventRoles.length > 0 &&
              event.userEventRoles.map((userEventRole) => (
                <UserEventRoleItem
                  userEventRole={userEventRole}
                  key={crypto.randomUUID()}
                />
              ))}
            {event.userEventRoles.length === 0 && (
              <div className='flex flex-col rounded-xl text-muted-foreground p-6 w-full items-center justify-center border border-dashed'>
                <Bird />
                <p>No users assigned... yet.</p>
                <p className='text-xs mt-1'>It's a lil empty here innit</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
