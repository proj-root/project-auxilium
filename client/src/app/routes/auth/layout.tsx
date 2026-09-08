import { LoadingComponent } from '@/components/misc/loading';
import { safeRedirectTo } from '@/features/auth/lib/redirect-to';
import { authClient } from '@/lib/auth-client';
import { useLayoutEffect } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router';

export default function AuthLayout() {
  const navigate = useNavigate();
  const { data, isPending, error } = authClient.useSession();
  const [searchParams] = useSearchParams();

  const destination = safeRedirectTo(searchParams);

  useLayoutEffect(() => {
    if (data?.session && data?.user) {
      navigate(destination, { replace: true });
    }
  }, [data, isPending, navigate, destination]);

  if (isPending) return <LoadingComponent />;

  // User not authenticated, show login and register pages
  if (!isPending && (!data?.session || !data?.user)) return <Outlet />;

  // While redirecting, render nothing
  return null;
}
