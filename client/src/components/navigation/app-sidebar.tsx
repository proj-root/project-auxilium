import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavGroup, NavGroupSecondary } from './nav-group';
import { SideBarNavFooterItems, SideBarNavItems } from '@/config/nav.config';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';
import { VersionInfo } from '../misc/version';
import { Separator } from '../ui/separator';

export function AppSidebarHeader() {
  const { state } = useSidebar();

  return (
    <div className='flex h-full w-fit flex-row items-center gap-2 py-1'>
      <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
        <SidebarTrigger />
      </div>
      <Link to={'/'}>
        <div
          className={cn(
            'flex flex-row items-center gap-2 text-left text-lg tracking-widest',
            state === 'collapsed' && 'hidden',
          )}
        >
          {/* <h1 className='font-medium'>G.A.R.D.E.N.</h1>
          <span className='text-muted-foreground/50 text-xs'>
            All-in-One Terminal
          </span> */}
          <img src={'/logo-dark.png'} className='h-8 w-22 object-cover' />
          <h1 className='font-semibold'>ADMIN</h1>
        </div>
      </Link>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props} className='font-mono'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <AppSidebarHeader />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={SideBarNavItems} />
        {/* TODO: Add superadmin-only links */}
        <NavGroupSecondary items={SideBarNavFooterItems} className='mt-auto' />
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <VersionInfo className='px-2'/>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
