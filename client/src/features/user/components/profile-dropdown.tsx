import { useCallback, useState } from 'react';
import { useGetPersonalDetailsQuery } from '../state/user-api-slice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Home,
  Settings,
  Shield,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { createUserInitials } from '@/lib/formatters';
import { RolesConfig } from '@auxilium/configs/roles';

function UnlinkedProfileAlert() {
  return (
    <div className='rounded-xl border border-amber-400 bg-amber-300/10 px-3 py-2'>
      <div className='mb-1.5 flex flex-row items-center gap-1.5'>
        <AlertTriangle className='size-4' />
        <span className='text-sm'>Profile not linked</span>
      </div>
      <p className='text-xs font-light'>
        Your account is not yet linked to your academic details. <br />
        To unlock more features and statistics, please do so{' '}
        <a href='/link-profile' className='underline'>
          here
        </a>
        .
      </p>
    </div>
  );
}

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useGetPersonalDetailsQuery();

  const showAvatarBadge = useCallback(() => {
    if (!data?.data.userProfile) {
      return true;
    }

    return false;
  }, [data]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className='flex cursor-pointer flex-row items-center gap-1 outline-0'>
        <Avatar className='me-2 size-7 outline-2'>
          <AvatarImage src={data?.data.image} />
          <AvatarFallback className='text-xs'>
            {createUserInitials(
              data?.data.name ||
                data?.data.userProfile?.firstName +
                  ' ' +
                  data?.data.userProfile?.lastName ||
                '',
            )}
          </AvatarFallback>
          {showAvatarBadge() && <AvatarBadge className='bg-red-400' />}
        </Avatar>
        <p className='font-semibold'>
          {data?.data.userProfile?.firstName || data?.data.name.split(' ')[0]}
        </p>
        {isOpen ? (
          <ChevronUp className='size-5' />
        ) : (
          <ChevronDown className='mt-1 size-5' />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='flex w-(--radix-dropdown-menu-trigger-width) min-w-72 flex-col gap-2 rounded-md p-2'
        align='end'
        sideOffset={10}
      >
        {/* Header */}
        <div className='flex flex-col gap-1 px-1'>
          <h1>{data?.data.name}</h1>
          <span className='text-muted-foreground text-sm'>
            {data?.data.email}
          </span>
        </div>
        {!data?.data.userProfile && <UnlinkedProfileAlert />}
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
              to={'/'}
              className='flex flex-row items-center gap-2 text-sm'
              onClick={() => setIsOpen(false)}
            >
              <Home className='size-4' />
              Home
            </Link>
          </Button>
          {(data?.data.role.roleId === RolesConfig.ADMIN ||
            data?.data.role.roleId === RolesConfig.SUPERADMIN) && (
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
                <Shield className='size-4' />
                Admin Dashboard
              </Link>
            </Button>
          )}
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
