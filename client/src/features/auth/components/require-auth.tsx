import { LoadingComponent } from '@/components/misc/loading';
import type { RoleDTO } from '@/features/user/user.dto';
import { authClient } from '@/lib/auth-client';
import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';

type RequireAuthProps = {
  children: React.ReactNode;
  allowedRoles?: number[]; // Array of allowed role IDs
};

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const navigate = useNavigate();
  const { data, isPending } = authClient.useSession();

  // Helper: check if user has at least one allowed role
  const isAuthorized = () => {
    if (!allowedRoles || allowedRoles.length === 0) return true; // No restriction

    // @ts-expect-error - role is a custom attribute
    const userRole: RoleDTO = data?.user?.role || null;
    // @ts-expect-error - role is a custom attribute
    return allowedRoles.includes(parseInt(userRole.roleId));
  };

  useLayoutEffect(() => {
    if (!isPending && (!data?.session || !data?.user)) {
      // User not authenticated
      navigate('/auth/login', { replace: true });
    } else if (!isPending && data?.session && data?.user && !isAuthorized()) {
      // User authenticated but unauthorized
      navigate('/auth/unauthorized', { replace: true });
    }
  }, [data, isPending, navigate]);

  if (isPending || !data?.session || !data?.user) {
    return (
      <div className='h-screen'>
        <LoadingComponent />
      </div>
    );
  }

  // If authenticated and authorized, render the content
  if (isAuthorized()) {
    return <>{children}</>;
  }

  // If authenticated but not authorized for this route, show loading while redirecting
  return (
    <div className='h-screen'>
      <LoadingComponent />
    </div>
  );
}
