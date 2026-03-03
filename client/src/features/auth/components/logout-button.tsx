import { useAppDispatch } from '@/hooks/redux-hooks';
import { useLogoutMutation } from '../state/auth-api-slice';
import { logout } from '../state/auth-slice';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const [logoutApi] = useLogoutMutation();

  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message);
    }
  };

  return (
    <Button
      type='button'
      size={'sm'}
      variant={'ghost'}
      onClick={handleLogout}
      className='flex flex-row justify-baseline px-1! text-red-400'
    >
      <LogOut className='size-4' />
      Log Out
    </Button>
  );
}
