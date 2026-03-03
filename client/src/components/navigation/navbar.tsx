// import { UserProfileDropdown } from '@/features/user/components/profile-dropdown';
import { Separator } from '@/components/ui/separator';
import { ThemeToggler } from '../misc/theme-toggler';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectAuthState } from '@/features/auth/state/auth-slice';
import { Button } from '../ui/button';
import { Link } from 'react-router';
import { UserProfileDropdown } from '@/features/user/components/profile-dropdown';

export function NavBar() {
  const { accessToken } = useAppSelector(selectAuthState);

  return (
    <div className='bg-background flex flex-row items-center justify-between'>
      {/* TODO: Replace with actual logo next time */}
      <h1 className='text-xl font-semibold'>G.A.R.D.E.N.</h1>
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

        {!accessToken ? (
          <div className='flex flex-row gap-2'>
            <Button asChild size={'sm'}>
              <Link to={'/auth/login'}>Login</Link>
            </Button>
          </div>
        ) : (
          <UserProfileDropdown />
        )}
      </div>
    </div>
  );
}
