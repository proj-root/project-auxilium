import { LoadingComponent } from '@/components/misc/loading';
import { Button } from '@/components/ui/button';
import { CompleteProfileLinkForm, VerifyIdentityForm } from '@/features/auth/components/link-profile-forms';
import { selectLinkProfileState } from '@/features/auth/state/link-profile-slice';
import { useGetPersonalDetailsQuery } from '@/features/user/state/user-api-slice';
import { useAppSelector } from '@/hooks/redux-hooks';
import { authClient } from '@/lib/auth-client';
import { House } from 'lucide-react';
import { useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router';

// TODO: Play cool animations next time
function ProfileLinkPage() {
  const { step, profileExists } = useAppSelector(selectLinkProfileState);

  if (step === 1) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-10'>
        {/* Header */}
        <div className='flex flex-col items-center gap-3'>
          <h1 className='text-3xl'>Let's finish setting up your profile.</h1>
          <p className='text-muted-foreground text-center'>
            We need to link your account to a profile. This is a one-time
            process. <br />
            You can always do this step later, or update profile details in
            settings. <br />
          </p>
        </div>

        {/* Forms */}
        <div className='flex w-full max-w-md flex-col justify-center'>
          <VerifyIdentityForm />
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-10'>
        {/* Header */}
        <div className='flex flex-col items-center gap-3'>
          <h1 className='text-3xl'>Enter the OTP sent to your mail</h1>
          <p className='text-muted-foreground text-center'>
            {profileExists && "A profile already exists for this account. You can link your account via the OTP."}
            {!profileExists && "A profile does not yet exist for this account. You will need to create one."} <br/>
            Please do not refresh the page or navigate away. <br />
          </p>
        </div>

        {/* Forms */}
        <div className='flex w-full max-w-md flex-col justify-center'>
          <CompleteProfileLinkForm />
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-6'>
        <h1 className='text-3xl'>Congrats!</h1>
        <h1 className='text-xl'>Your account has been linked successfully!</h1>
        <img src='/success-confetti.png' className='max-w-sm' />
        <Button variant={'outline'} asChild>
          <Link to={'/'}><House /> Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h1>Wait how did you get here</h1>
    </div>
  );
}

export default function Page() {
  const navigate = useNavigate();
  const { data, isPending, error } = authClient.useSession();
  const { data: myDetails, isLoading } = useGetPersonalDetailsQuery();

  useLayoutEffect(() => {
    if (!isPending && !isLoading) {
      if (!data?.session || !data?.user || myDetails?.data.userProfile) {
        navigate('/', { replace: true });
      }
    }
  }, [data, isPending, isLoading, navigate]);

  if (isPending || isLoading) return <LoadingComponent />;

  if (data?.session && data?.user) {
    return <ProfileLinkPage />;
  }

  return null;
}
