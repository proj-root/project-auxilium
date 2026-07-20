import { Button } from "@/components/ui/button";
import { AccountSettings } from "@/features/user/components/settings-pages/account-settings";
import { Preferences } from "@/features/user/components/settings-pages/preferences";
import { ProfileSettings } from "@/features/user/components/settings-pages/profile-settings";
import { SettingsSidebar } from "@/features/user/components/settings-sidebar";
import { useState } from "react";
import { Link } from "react-router";

export type SettingsCategories = 'profile' | 'account' | 'preferences'

export default function SettingsPage() {
  const [category, setCategory] = useState<SettingsCategories>('profile');

  return (
    <div className='flex min-h-screen flex-col items-center justify-center w-full md:w-3xl xl:w-5xl'>
      <div className="min-h-full w-full flex flex-col py-8">
        {/* Header */}
        <div className="w-full flex flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Settings</h1>
          <Button asChild size={'sm'} variant={'outline'}>
            <Link to={'/profile/'}>Go to public profile</Link>
          </Button>
        </div>
        {/* Main Body */}
        <div className="flex gap-8 h-full">
          {/* Sidebar */}
          <SettingsSidebar category={category} setCategory={setCategory} />
          {/* Category pages */}
          <div className="w-full h-full">
            {category === 'profile' && <ProfileSettings />}
            {category === 'account' && <AccountSettings />}
            {category === 'preferences' && <Preferences />}
          </div>
        </div>
      </div>
    </div>
  )
}