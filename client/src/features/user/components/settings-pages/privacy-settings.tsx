import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  useGetPublicProfileQuery,
  useUpdatePrivacyMutation,
} from '@/features/profile/state/profile-api-slice';
import { authClient } from '@/lib/auth-client';
import { Check, Lock, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * What a visitor can see either way. Spelled out next to the switch because
 * "private" on its own does not say whether it hides the account or the page.
 */
const VISIBLE_WHEN_PUBLIC = [
  'Your display name and avatar',
  'Your course',
  'Your forum posts, and when you joined',
];

const VISIBLE_WHEN_PRIVATE = [
  'Your display name and avatar, as they already appear on your forum posts',
];

function ProfileVisibilitySetting() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  // Reading the public profile rather than the account gives the switch the
  // same value a visitor would resolve, so it cannot drift from what is served.
  const { data, isLoading } = useGetPublicProfileQuery(
    { userId: userId ?? '' },
    { skip: !userId },
  );
  const [updatePrivacy, { isLoading: isSaving }] = useUpdatePrivacyMutation();

  const isPrivate = data?.data.isPrivate ?? false;

  const onToggle = async (nextPrivate: boolean) => {
    try {
      await updatePrivacy({ isPrivate: nextPrivate }).unwrap();
      toast.success(
        nextPrivate
          ? 'Your profile is now private'
          : 'Your profile is now public',
      );
    } catch (error) {
      toast.error(
        'Could not change your profile visibility. Please try again.',
      );
      console.error('ProfileVisibilitySetting Error:', error);
    }
  };

  return (
    <div className='border-muted flex flex-col gap-4 rounded-md border p-3'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='flex items-center gap-2'>
            <Lock className='size-4' /> Private profile
          </h1>
          <p className='text-muted-foreground text-sm'>
            Hides your profile page from everyone but you. Your existing posts
            stay on the forum either way.
          </p>
        </div>
        {isLoading ? (
          <Skeleton className='h-5 w-8 rounded-full' />
        ) : (
          <Switch
            checked={isPrivate}
            onCheckedChange={onToggle}
            disabled={isSaving || !userId}
            aria-label='Make my profile private'
          />
        )}
      </div>

      <Separator />

      <div className='flex flex-col gap-2'>
        <p className='text-muted-foreground font-mono text-xs tracking-wide uppercase'>
          {isPrivate ? 'Visitors can see' : 'Anyone can see'}
        </p>
        <ul className='flex flex-col gap-1'>
          {(isPrivate ? VISIBLE_WHEN_PRIVATE : VISIBLE_WHEN_PUBLIC).map(
            (item) => (
              <li key={item} className='flex items-center gap-2 text-sm'>
                <Check className='size-4 shrink-0 text-emerald-500' />
                {item}
              </li>
            ),
          )}
          {isPrivate && (
            <li className='text-muted-foreground flex items-center gap-2 text-sm'>
              <X className='size-4 shrink-0' />
              Your course, posts and join date are hidden
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export function PrivacySettings() {
  return (
    <div>
      <h1 className='text-2xl'>Privacy</h1>
      <p className='text-muted-foreground text-sm'>
        Controls what other people see when they open your profile.
      </p>
      <Separator className='my-2' />
      <div className='flex flex-col gap-4'>
        <ProfileVisibilitySetting />
      </div>
    </div>
  );
}
