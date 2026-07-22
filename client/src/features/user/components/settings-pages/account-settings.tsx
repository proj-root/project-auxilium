import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skull, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useDeleteSelfMutation } from '../../state/user-api-slice';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

function DeleteSelfSetting() {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteSelf] = useDeleteSelfMutation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
    }
  }, [isOpen]);

  // Handle the 1-second countdown ticks
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  const handleDelete = async () => {
    try {
      await deleteSelf().unwrap();
      toast.success('Deleted your account successfully.');
      authClient.signOut();
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.data.message);
    }
  };

  return (
    <div className='flex items-center justify-between gap-2 p-3'>
      <div className='flex flex-col gap-1'>
        <h1>Delete Account</h1>
        <p className='text-muted-foreground text-sm'>
          Quite literally deletes your account and everything related to it.
          Permanently.
        </p>
      </div>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button variant={'destructive'}>Delete Account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className='bg-destructive/10 text-destructive size-12'>
              <Skull className='size-6' />
            </AlertDialogMedia>
            <AlertDialogTitle>
              Permanently delete your account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Once you go screaming over the edge, it's all over. Ain't no
              coming back, choom. Are you ABSOLUTELY SURE?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nevermind...</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete()}
              variant={'destructive'}
              disabled={countdown > 0}
            >
              {countdown > 0 ? `Wait ${countdown}s` : 'DELETE ACCOUNT'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AccountSettings() {
  return (
    <div>
      <h1 className='text-2xl'>Linked Accounts</h1>
      <Separator className='my-2' />
      <div className='mb-2 flex flex-col gap-2 py-2'>
        {/* TODO: Update account linking form */}
        <div className='text-muted-foreground flex w-full items-center justify-center rounded-md border border-dashed p-6'>
          <h1>Coming soon...</h1>
        </div>
      </div>
      <h1 className='mb-3 text-2xl'>Danger Zone</h1>
      <div className='border-destructive gap-4 rounded-md border'>
        <DeleteSelfSetting />
      </div>
    </div>
  );
}
