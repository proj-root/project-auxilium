import type { SettingsCategories } from '@/app/routes/settings';
import { cn } from '@/lib/utils';
import { Settings, SquareMenu, UserCircle2 } from 'lucide-react';

// interface SettingsSidebarItemProps {
//   label: string;
//   category: SettingsCategories;
//   icon: keyof typeof Icons;
// }

// function SettingsSidebarItem({ label, category, icon }: SettingsSidebarItemProps) {
//   return (
//     <div className="flex gap-2 rounded-md hover:bg-accent">

//     </div>
//   )
// }

interface SettingsSidebarProps {
  category: SettingsCategories;
  setCategory: (category: SettingsCategories) => void;
}

export function SettingsSidebar({
  category,
  setCategory,
}: SettingsSidebarProps) {
  return (
    <div className='flex w-xs flex-col gap-2'>
      <div
        onClick={() => setCategory('profile')}
        className={cn(
          'hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1',
          category === 'profile' && 'bg-muted',
        )}
      >
        <UserCircle2 className='size-5' /> Profile
      </div>
      <div
        onClick={() => setCategory('account')}
        className={cn(
          'hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1',
          category === 'account' && 'bg-muted',
        )}
      >
        <Settings className='size-5' /> Account
      </div>
      <div
        onClick={() => setCategory('preferences')}
        className={cn(
          'hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1',
          category === 'preferences' && 'bg-muted',
        )}
      >
        <SquareMenu className='size-5' /> Preferences
      </div>
    </div>
  );
}
