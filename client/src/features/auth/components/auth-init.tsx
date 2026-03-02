import { useAppDispatch } from '@/hooks/redux-hooks';
import { useRefreshMutation } from '../state/auth-api-slice';
import { useEffect } from 'react';
import {
  setAccessToken,
  setAuthLoading,
  setRoleId,
  setUserId,
} from '../state/auth-slice';
import { jwtDecode } from 'jwt-decode';
import { Loader2 } from 'lucide-react';

// This component refreshes the auth state on page reload to persist acess token state
export function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [refresh, { isLoading }] = useRefreshMutation();

  useEffect(() => {
    const initialiseAuth = async () => {
      console.log('Initialising auth state...');
      try {
        dispatch(setAuthLoading(true));
        console.log('Refreshing access token...');
        const { data } = await refresh().unwrap();
        const accessToken = data?.accessToken;

        if (!accessToken) {
          console.warn('No accessToken returned.');
        } else {
          dispatch(setAccessToken(accessToken));

          const payload: { userId: string; roleId: number } =
            await jwtDecode(accessToken);

          dispatch(setUserId(payload.userId));
          dispatch(setRoleId(payload.roleId));
        }
      } catch (error) {
        console.error('Error initialising auth:', error);
      } finally {
        dispatch(setAuthLoading(false));
        console.log('Finished initialising auth state.');
      }
    };
    initialiseAuth();
  }, [dispatch, refresh]);

  if (isLoading)
    return (
      <div className='text-muted-foreground flex h-screen w-full items-center justify-center gap-4'>
        <Loader2 className='size-10 animate-spin' />
        <h1 className='text-2xl font-semibold'>Loading...</h1>
      </div>
    );

  return <>{children}</>;
}
