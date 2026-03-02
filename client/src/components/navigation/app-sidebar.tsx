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
import { Plus } from 'lucide-react';
import { Link } from 'react-router';

export function AppSidebarHeader() {
  const { state } = useSidebar();

  return (
    <div className='flex h-full w-fit flex-row items-center gap-2 py-1'>
      <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
        <SidebarTrigger />
      </div>
      <div
        className={cn(
          'flex flex-col text-left text-lg leading-tight',
          state === 'collapsed' && 'hidden',
        )}
      >
        <h1 className='font-medium'>G.A.R.D.E.N.</h1>
        <span className='text-muted-foreground/50 text-xs'>
          All-in-One Terminal
        </span>
      </div>
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
