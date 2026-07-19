import { GridBackground } from '@/components/decorative/grid-background';
import { NavBar } from '@/components/navigation/navbar';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-forms';
import { useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';

export default function ResetPasswordPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchParams.get('token')) {
      navigate('/');
    }
  }, [searchParams]);

  // Prevent access if no token in search params
  if (!searchParams.get('token')) return <></>;

  return (
    <div className='flex h-screen min-h-screen w-full flex-col'>
      <NavBar />
      <div className='z-1 flex min-h-full justify-center'>
        <div className='mt-20 flex w-xl flex-col gap-4 p-8 md:px-16'>
          {/* Header */}
          <h1 className='text-3xl font-semibold'>Reset your password</h1>
          <ResetPasswordForm token={searchParams.get('token') ?? ''} />
        </div>
      </div>
    </div>
  );
}
