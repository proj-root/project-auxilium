import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoginForm } from '@/features/auth/components/login-form';
import { Link } from 'react-router';

export default function LoginPage() {
  return (
    <div className='flex min-h-screen w-full items-center justify-center p-4'>
      <div className='flex w-xl flex-col gap-4 p-8 md:px-16'>
        {/* Header */}
        <Link to={'/'} className='flex flex-row items-center gap-2'>
          <Avatar>
            <AvatarImage src='/logo.png' alt='seed logo'/>
          </Avatar>
          <h1 className='text-lg font-semibold'>GARDEN Terminal</h1>
        </Link>
        <h1 className='text-3xl font-semibold'>Welcome back!</h1>

        {/* Main Form */}
        <LoginForm />
        <div className='text-muted-foreground flex flex-row text-sm'>
          <p>Don&apos;t have an account?&nbsp;</p>
          <Link to={'/auth/register'} className='underline'>
            Register!
          </Link>
        </div>
      </div>
    </div>
  );
}
