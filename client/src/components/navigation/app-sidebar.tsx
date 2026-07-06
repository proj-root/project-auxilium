import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavGroup, NavGroupSecondary } from './nav-group';
import { SideBarNavFooterItems, SideBarNavItems } from '@/config/nav.config';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';
import { useTheme } from 'next-themes';

export function AppSidebarHeader() {
  const { resolvedTheme } = useTheme();
  const { state } = useSidebar();

  return (
    <div className='flex h-full w-fit flex-row items-center gap-2 py-1'>
      <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
        <SidebarTrigger />
      </div>
      <Link to={'/'}>
        <div
          className={cn(
            'flex flex-row text-left text-lg tracking-widest items-center',
            state === 'collapsed' && 'hidden',
          )}
        >
          {/* <h1 className='font-medium'>G.A.R.D.E.N.</h1>
          <span className='text-muted-foreground/50 text-xs'>
            All-in-One Terminal
          </span> */}
          <img src={resolvedTheme === 'dark' ? './logo-dark.png' : './logo-light.png'} className='w-30 h-10 object-cover'/>
          <h1 className='font-semibold'>ADMIN</h1>
        </div>
      </Link>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
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
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
