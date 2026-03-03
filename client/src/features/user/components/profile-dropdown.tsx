import { useState } from 'react';
import { useGetPersonalDetailsQuery } from '../state/user-api-slice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, ChevronUp, Home, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { LogoutButton } from '@/features/auth/components/logout-button';

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useGetPersonalDetailsQuery();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className='flex cursor-pointer flex-row items-center gap-3 outline-0'>
        <Avatar className='size-8 rounded-full outline-2'>
          <AvatarFallback>
            {(data?.data.userProfile.firstName?.charAt(0).toUpperCase() || '') +
              (data?.data.userProfile.lastName?.charAt(0).toUpperCase() || '')}
          </AvatarFallback>
        </Avatar>
        <p className='font-semibold'>
          {data?.data.userProfile.firstName}
        </p>
        {isOpen ? (
          <ChevronUp className='size-5' />
        ) : (
          <ChevronDown className='size-5' />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='flex w-(--radix-dropdown-menu-trigger-width) min-w-56 flex-col gap-2 rounded-md p-2'
        align='end'
        sideOffset={10}
      >
        {/* Header */}
        <div className='flex flex-col gap-1 px-1'>
          <h1>
            {data?.data.userProfile.firstName} {data?.data.userProfile.lastName}
          </h1>
          <span className='text-muted-foreground text-sm'>
            {data?.data.email}
          </span>
        </div>
        <Separator />
        <div className='flex flex-col'>
          <Button
            asChild
            type='button'
            size={'sm'}
            variant={'ghost'}
            className='justify-baseline px-1!'
          >
            <Link
              to={'/admin'}
              className='flex flex-row items-center gap-2 text-sm'
              onClick={() => setIsOpen(false)}
            >
              <Home className='size-4' />
              Dashboard
            </Link>
          </Button>
          <Button
            asChild
            type='button'
            size={'sm'}
            variant={'ghost'}
            className='justify-baseline px-1!'
          >
            <Link
              to={'/settings'}
              className='flex flex-row items-center gap-2 text-sm'
              onClick={() => setIsOpen(false)}
            >
              <Settings className='size-4' />
              Settings (WIP)
            </Link>
          </Button>
        </div>
        <Separator />
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
