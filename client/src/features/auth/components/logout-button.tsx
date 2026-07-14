import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useNavigate } from 'react-router';

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Bring user back to homepage
            navigate('/');
          }
        }
      });

      if (error) {
        toast.error(error.message)
        console.error("UserSignoutError:", error);
      }
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
