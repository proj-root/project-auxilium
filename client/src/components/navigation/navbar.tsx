// import { UserProfileDropdown } from '@/features/user/components/profile-dropdown';
import { Separator } from '@/components/ui/separator';
import { ThemeToggler } from '../misc/theme-toggler';
import { Button } from '../ui/button';
import { Link } from 'react-router';
import { UserProfileDropdown } from '@/features/user/components/profile-dropdown';
import { authClient } from '@/lib/auth-client';
import { useTheme } from 'next-themes';

export function NavBar() {
  const { resolvedTheme } = useTheme();
  const { data, isPending, error } = authClient.useSession();

  return (
    <div className='bg-background flex flex-row items-center justify-between'>
      <img src={resolvedTheme === 'dark' ? './logo-dark.png' : './logo-light.png'} className='w-45 h-15 object-cover'/>
      <nav className='flex flex-row gap-4'>
        {/* TODO: Put navigation links here */}
      </nav>
      <div className='flex flex-row items-center gap-3'>
        {/* TODO: QoL updates */}
        <ThemeToggler />
        {/* <NotificationButton /> */}

        <Separator
          orientation='vertical'
          className='border-muted border-l-[0.5px] data-[orientation=vertical]:h-8'
        />

        {!data && !isPending ? (
          <div className='flex flex-row gap-2'>
            <Button asChild size={'sm'}>
              <Link to={'/auth/login'}>Login</Link>
            </Button>
            <Button asChild size={'sm'} variant={'secondary'}>
              <Link to={'/auth/register'}>Register</Link>
            </Button>
          </div>
        ) : (
          <UserProfileDropdown />
        )}
      </div>
    </div>
  );
}
