import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EyeOff } from 'lucide-react';
import { Link } from 'react-router';
import { useGetPublicProfileQuery } from '../state/profile-api-slice';
import { PrivateProfile } from './private-profile';
import { ProfileCover } from './profile-cover';
import { ProfileHeader } from './profile-header';
import { ProfilePosts } from './profile-posts';
import { ProfileStats } from './profile-stats';

/**
 * The page behind /users/:userId, readable signed out.
 *
 * `details` arrives null when the profile is locked and you are not its owner,
 * so the private branch here is rendering an absence the server created — the
 * hidden fields were never in the response to begin with.
 */
export function PublicProfile({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useGetPublicProfileQuery({ userId });

  if (isLoading) return <ProfileSkeleton />;

  const profile = data?.data;

  if (isError || !profile) {
    return (
      <div className='flex w-full max-w-3xl flex-col items-center justify-center gap-6 py-16'>
        <img src='/not-found.png' alt='User not found' className='max-w-sm' />
        <div className='flex flex-col items-center gap-1'>
          <p className='text-2xl'>No such user</p>
          <p className='text-muted-foreground'>
            This profile may have been deleted
          </p>
        </div>
        <Button variant='outline' asChild>
          <Link to='/forum'>Back to the forum</Link>
        </Button>
      </div>
    );
  }

  const { details } = profile;

  return (
    <div className='flex w-full max-w-3xl flex-col gap-4 py-6'>
      <ProfileHeader profile={profile} />

      {details ? (
        <>
          {profile.isSelf && profile.isPrivate && (
            <div className='text-muted-foreground flex flex-row items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm'>
              <EyeOff className='size-4 shrink-0' />
              Your profile is private — only you can see what is below.
            </div>
          )}

          <Separator className='my-2' />

          <ProfileStats
            postCount={details.postCount}
            commentCount={details.commentCount}
            joinedAt={details.joinedAt}
          />

          <Separator className='my-2' />

          <ProfilePosts
            userId={profile.userId}
            name={profile.name}
            isSelf={profile.isSelf}
          />
        </>
      ) : (
        <>
          <Separator className='my-2' />
          <PrivateProfile />
        </>
      )}
    </div>
  );
}

/** Mirrors the real layout element for element so the page does not jump. */
function ProfileSkeleton() {
  return (
    <div className='flex w-full max-w-3xl flex-col gap-4 py-6'>
      <div className='flex flex-col'>
        <ProfileCover />
        <div className='px-1'>
          <Skeleton className='ring-background -mt-12 size-24 rounded-full ring-4 sm:-mt-14 sm:size-28' />
        </div>
        <div className='mt-4 flex flex-col gap-2'>
          <Skeleton className='h-9 w-56 rounded-md' />
          <Skeleton className='h-5 w-72 rounded-md' />
        </div>
      </div>

      <Separator className='my-2' />

      <div className='flex flex-row gap-8'>
        <Skeleton className='h-9 w-16 rounded-md' />
        <Skeleton className='h-9 w-20 rounded-md' />
        <Skeleton className='h-9 w-24 rounded-md' />
      </div>

      <Separator className='my-2' />

      <Skeleton className='h-6 w-20 rounded-md' />
      <div className='flex flex-col gap-4'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className='flex flex-col gap-2'>
            <Skeleton className='h-6 w-2/3 rounded-md' />
            <Skeleton className='h-4 w-full rounded-md' />
            <Skeleton className='h-4 w-5/6 rounded-md' />
          </div>
        ))}
      </div>
    </div>
  );
}
