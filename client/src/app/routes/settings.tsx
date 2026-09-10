import { Button } from '@/components/ui/button';
import { AccountSettings } from '@/features/user/components/settings-pages/account-settings';
import { Preferences } from '@/features/user/components/settings-pages/preferences';
import { PrivacySettings } from '@/features/user/components/settings-pages/privacy-settings';
import { ProfileSettings } from '@/features/user/components/settings-pages/profile-settings';
import { SettingsSidebar } from '@/features/user/components/settings-sidebar';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { Link } from 'react-router';

export type SettingsCategories =
  | 'profile'
  | 'account'
  | 'preferences'
  | 'privacy';

export default function SettingsPage() {
  const [category, setCategory] = useState<SettingsCategories>('profile');
  const { data: session } = authClient.useSession();

  return (
    <div className='flex min-h-screen w-full flex-col items-center justify-center md:w-3xl xl:w-5xl'>
      <div className='flex min-h-full w-full flex-col py-8'>
        {/* Header */}
        <div className='mb-6 flex w-full flex-row items-center justify-between'>
          <h1 className='text-3xl font-semibold'>Settings</h1>
          <Button asChild size={'sm'} variant={'outline'} disabled={!session}>
            <Link to={session ? `/users/${session.user.id}` : '/settings'}>
              Go to public profile
            </Link>
          </Button>
        </div>
        {/* Main Body */}
        <div className='flex h-full gap-8'>
          {/* Sidebar */}
          <SettingsSidebar category={category} setCategory={setCategory} />
          {/* Category pages */}
          <div className='h-full w-full'>
            {category === 'profile' && <ProfileSettings />}
            {category === 'account' && <AccountSettings />}
            {category === 'preferences' && <Preferences />}
            {category === 'privacy' && <PrivacySettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
