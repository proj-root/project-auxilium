import { AppSidebar } from '@/components/navigation/app-sidebar';
import { SiteHeader } from '@/components/navigation/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { RequireAuth } from '@/features/auth/components/require-auth';
import { Roles } from '@auxilium/configs/roles';
import { Outlet } from 'react-router';

export default function DashboardLayout() {
  return (
    <RequireAuth allowedRoles={[Roles.ADMIN, Roles.SUPERADMIN]}>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 64)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className='@container/main flex h-full flex-1 flex-col gap-2 p-6'>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  );
}
