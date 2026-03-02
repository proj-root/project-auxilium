import { useAppSelector } from '@/hooks/redux-hooks';
import { selectAuthState } from '../state/auth-slice';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Roles } from '@auxilium/configs/roles';
import { Loader2 } from 'lucide-react';

export function RequireAuth({
  allowedRoles = [],
  children,
}: {
  allowedRoles?: number[];
  children: React.ReactNode;
}) {
  const { userId, roleId, loading } = useAppSelector(selectAuthState);
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);

  const checkAccess = async () => {
    console.log('RequireAuth: checkAccess - starting', {
      userId,
      roleId,
      loading,
      allowedRoles,
    });

    try {
      if (!userId) {
        toast.error('Please login to continue!');
        console.log('RequireAuth: No userId, redirecting...');
        navigate('/auth/login');
        return;
      }

      const isAllowedRole =
        allowedRoles.length === 0 || allowedRoles.includes(roleId as number);

      if (!isAllowedRole && roleId !== Roles.SUPERADMIN) {
        console.log('RequireAuth: Forbidden, redirecting...');
        navigate('/');
        return;
      }

      console.log('RequireAuth: Access granted');
    } catch (err) {
      console.error('RequireAuth Error:', err);
      setError(err as Error);
    } finally {
      console.log('RequireAuth: Finished');
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    } else {
      checkAccess();
    }
  }, [loading, userId, roleId]);

  if (error) {
    throw error;
  }

  if (loading) {
    return (
      <div className='text-muted-foreground flex h-screen w-full items-center justify-center gap-4'>
        <Loader2 className='size-10 animate-spin' />
        <h1 className='text-xl font-semibold'>Loading...</h1>
      </div>
    );
  }

  // Prevent children from loading if not logged in yet
  const isAllowedRole =
    allowedRoles.length === 0 || allowedRoles.includes(roleId as number);
  if (!isAllowedRole || !userId) {
    return null;
  }

  return <>{children}</>;
}