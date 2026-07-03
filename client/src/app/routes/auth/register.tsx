import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import { GitHubSSOButton, GoogleSSOButton } from '@/features/auth/components/sso-buttons';
import { Link } from 'react-router';

export default function LoginPage() {
  return (
    <div className='flex min-h-screen w-full items-center justify-center p-4'>
      <div className='flex w-xl flex-col gap-4 p-8 md:px-16'>
        {/* Header */}
        <Link to={'/'} className='flex flex-row items-center gap-2'>
          <Avatar>
            <AvatarImage src='/logo.png' alt='seed logo' />
          </Avatar>
          <h1 className='text-lg font-semibold'>The GARDEN Terminal</h1>
        </Link>
        <h1 className='text-3xl font-semibold'>Create your account</h1>

        <div className='flex flex-col gap-4'>
          {/* Main Form */}
          <RegisterForm />
          <Separator />
          <GoogleSSOButton />
          <GitHubSSOButton />
        </div>

        <div className='text-muted-foreground flex flex-row text-sm'>
          <p>Already have an account?&nbsp;</p>
          <Link to={'/auth/login'} className='underline'>
            Login!
          </Link>
        </div>
      </div>
    </div>
  );
}
