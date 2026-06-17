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
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  CircleX,
  Copy,
  Loader2,
  UserPlus,
} from 'lucide-react';
import type { Event, UserEventRole } from '../events.dto';
import { useEffect, useRef, useState } from 'react';
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
import {
  useAssignUserToEventMutation,
  useGetAllEventRolesQuery,
  useUnassignUserFromEventMutation,
} from '../state/events-api-slice';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

function UserSearchItem({ user, eventId }: { user: UserDTO; eventId: string }) {
  const isAlreadyAssigned = user.userEventRoles.find(
    (uer) => uer.eventId === eventId,
  );

  return (
    <div
      className={cn(
        'flex flex-row items-center justify-between gap-4 rounded-md p-2',
        !isAlreadyAssigned && 'hover:bg-accent hover:cursor-pointer',
      )}
    >
      <Avatar className='size-8'>
        <AvatarImage
          src={user.image}
          className={isAlreadyAssigned && 'grayscale'}
        />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className='flex w-full flex-col'>
        <p
          className={cn(
            'flex flex-row items-baseline gap-1',
            isAlreadyAssigned && 'text-muted-foreground',
          )}
        >
          {user.name}{' '}
          {isAlreadyAssigned && <span className='text-xs italic'>(added)</span>}
        </p>
        <p className='text-muted-foreground text-sm'>
          {user.userProfile.ichat}
        </p>
      </div>
    </div>
  );
}

function UserSearchBar({ eventId }: { eventId: string }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState('');
  const [assignUserToEvent] = useAssignUserToEventMutation();

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: userSearchData,
    isLoading,
    isError,
  } = useGetAllUsersQuery({
    roleIds: [RolesConfig.ADMIN, RolesConfig.SUPERADMIN],
    search: inputValue,
  });

  const handleAssignUser = async ({ userId }: { userId: string }) => {
    console.log('Assigning user to event:', { userId, eventId });
    try {
      const { error } = await assignUserToEvent({
        userId,
        eventId,
        eventRoleId: '2', // TODO: Allow selecting event role when assigning user next time
      });

      if (error) {
        console.error('Error assigning user to event:', error);
        toast.error('Failed to assign user to event. Please try again.');
        return;
      }
    } catch (error) {
      console.error('Error assigning user to event:', error);
      toast.error('Failed to assign user to event. Please try again.');
    } finally {
      setInputValue('');
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the click happened OUTSIDE our main container, close the dropdown
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='relative' ref={containerRef}>
      <Input
        placeholder='Add people...'
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (e.target.value.trim() !== '') {
            setIsOpen(true);
          } else setIsOpen(false);
        }}
        // onBlur={() => setIsOpen(false)}
        className='w-full'
      />
      {/* Custom popover */}
      {/* TODO: Add animations next time */}
      <div
        onBlur={() => setIsOpen(false)}
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
              <div
                onMouseDown={(e) => {
                  if (
                    user.userEventRoles.find((uer) => uer.eventId === eventId)
                  ) {
                    return null;
                  } else {
                    e.preventDefault(); // Prevents the input from losing focus
                    handleAssignUser({ userId: user.id });
                  }
                }}
                key={user.id}
              >
                <UserSearchItem user={user} eventId={eventId} />
              </div>
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

function UserEventRoleDropdown({
  userEventRole,
}: {
  userEventRole: UserEventRole;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: eventRolesData, isLoading } = useGetAllEventRolesQuery();
  const [assignUserToEvent] = useAssignUserToEventMutation();
  const [unassignUserFromEvent] = useUnassignUserFromEventMutation();

  const handleChangeRole = async (eventRoleId: string) => {
    try {
      await assignUserToEvent({
        userId: userEventRole.user.id,
        eventId: userEventRole.eventId,
        eventRoleId,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role. Please try again.');
    }
  };

  const handleRemoveRole = async () => {
    try {
      await unassignUserFromEvent({
        userId: userEventRole.user.id,
        eventId: userEventRole.eventId,
      });
    } catch (error) {
      console.error('Error removing user role:', error);
      toast.error('Failed to remove user role. Please try again.');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button className='hover:bg-muted flex cursor-pointer flex-row items-center gap-1 rounded-md px-3 py-2 text-nowrap'>
          {userEventRole.eventRole.name}{' '}
          {isOpen ? (
            <ChevronUp className='size-4' />
          ) : (
            <ChevronDown className='size-4' />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-40'
        align='end'
        onWheel={(e) => e.stopPropagation()}
      >
        <DropdownMenuGroup className='flex flex-col gap-1'>
          {/* Filter out participation role */}
          <ScrollArea className='h-32 w-full rounded-md pe-3'>
            {eventRolesData?.data
              .filter((er) => er.pointsType !== 'PARTICIPATION')
              .map((eventRole) => (
                <DropdownMenuItem
                  onClick={() =>
                    handleChangeRole(eventRole.eventRoleId.toString())
                  }
                  className='flex w-full flex-row items-center justify-between'
                  key={eventRole.eventRoleId}
                >
                  <p>{eventRole.name}</p>
                  <span className='text-muted-foreground text-xs'>
                    {eventRole.pointsAwarded} pts
                  </span>
                </DropdownMenuItem>
              ))}
          </ScrollArea>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant='destructive'
            onClick={() => handleRemoveRole()}
          >
            Remove Role
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
      {/* <div className='text-nowrap'>
        <p>{userEventRole.eventRole.name}</p>
      </div> */}
      <UserEventRoleDropdown userEventRole={userEventRole} />
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
          <UserSearchBar eventId={event.eventId} />
        </div>
        {/* Assigned Users */}
        <div className='flex flex-col'>
          <div className='mb-3 flex flex-row items-center justify-between'>
            <h1 className='text-lg'>
              Added Members{' '}
              <span className='text-base'>
                ({event.userEventRoles && event.userEventRoles.length})
              </span>
            </h1>
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
                  key={userEventRole.user.userProfile.profileId}
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
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
