import { UserProfileDropdown } from '@/features/user/components/profile-dropdown';
import { Separator } from '@/components/ui/separator';
import { ThemeToggler } from '@/components/misc/theme-toggler';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function SiteHeader() {
  return (
    <header className='bg-background sticky top-0 z-50 hidden h-(--header-height) shrink-0 items-center gap-2 border-b shadow transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:flex'>
      <nav className='flex h-full w-full flex-row items-center justify-between gap-1 px-4 lg:gap-2'>
        {/* TODO: Implement Search Bar for better navigation */}
        {/* <SearchMenu /> */}
        <h1>Dashboard</h1>
        <div className='flex flex-row items-center gap-3'>
          <div className='flex flex-row items-center gap-1'>
            <ThemeToggler />
          </div>
          <Separator
            orientation='vertical'
            className='border-muted border-l-[0.5px] data-[orientation=vertical]:h-8'
          />
          <div className='flex flex-row items-center gap-4'>
            <UserProfileDropdown />
          </div>
        </div>
      </nav>
    </header>
  );
}