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
import {
  Bird,
  ChevronsUpDown,
  CircleX,
  Copy,
  Loader2,
  UserPlus,
} from 'lucide-react';
import type { Event, UserEventRole } from '../events.dto';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useGetAllUsersQuery } from '@/features/user/state/user-api-slice';
import { RolesConfig } from '@auxilium/configs/roles';
import type { UserDTO } from '@/features/user/user.dto';

function UserSearchItem({ user }: { user: UserDTO }) {
  return (
    <div className='hover:bg-accent flex flex-row items-center justify-between gap-4 hover:cursor-pointer rounded-md p-2'>
      <Avatar className='size-8'>
        <AvatarImage src={user.image} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className='flex w-full flex-col'>
        <p>{user.name}</p>
        <p className='text-muted-foreground text-sm'>
          {user.userProfile.ichat}
        </p>
      </div>
    </div>
  );
}

function UserSearchBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState('');

  const {
    data: userSearchData,
    isLoading,
    isError,
  } = useGetAllUsersQuery({
    roleIds: [RolesConfig.ADMIN, RolesConfig.SUPERADMIN],
    search: inputValue,
  });

  return (
    <div className='relative'>
      <Input
        placeholder='Add people...'
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (e.target.value.trim() !== '') {
            setIsOpen(true);
          } else setIsOpen(false);
        }}
        className='w-full'
        onBlur={() => setIsOpen(false)}
      />
      {/* Custom popover */}
      {/* TODO: Add animations next time */}
      <div
        className={cn(
          'bg-card left-0 z-10 mt-3 max-h-50 w-full rounded-md p-1 shadow-md',
          isOpen ? 'absolute' : 'hidden',
        )}
      >
        <div className='flex h-full w-full scrollbar-none flex-col justify-center gap-2 overflow-y-scroll'>
          {/* Loading State */}
          {isLoading && (
            <Loader2 className='text-muted-foreground size-7 animate-spin' />
          )}
          {/* Empty State */}
          {userSearchData?.data.users.length === 0 && (
            <div className='flex w-full flex-col items-center justify-center gap-0.5 p-2'>
              <p className='text-muted-foreground'>No users found</p>
              <p className='text-muted-foreground text-xs'>
                Try using the member's name or email address
              </p>
            </div>
          )}
          {userSearchData &&
            userSearchData?.data.users.map((user) => (
              <UserSearchItem user={user} key={crypto.randomUUID()} />
            ))}
          {/* Error State */}
          {isError && (
            <div className='flex w-full flex-col items-center justify-center gap-2 p-2'>
              <CircleX className='text-muted-foreground size-7' />
              <p className='text-muted-foreground'>
                Oops! An error occurred while fetching users
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserEventRoleItem({
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
          <UserSearchBar />
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
          <div className='flex max-h-40 w-full scrollbar-none flex-col gap-3 overflow-y-scroll'>
            {event.userEventRoles.length > 0 &&
              event.userEventRoles.map((userEventRole) => (
                <UserEventRoleItem
                  userEventRole={userEventRole}
                  key={crypto.randomUUID()}
                />
              ))}
            {event.userEventRoles.length === 0 && (
              <div className='text-muted-foreground flex w-full flex-col items-center justify-center rounded-xl border border-dashed p-6'>
                <Bird />
                <p>No users assigned... yet.</p>
                <p className='mt-1 text-xs'>It's a lil empty here innit</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className='border-t pt-4'>
          <DialogClose asChild>
            <Button variant='outline'>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
