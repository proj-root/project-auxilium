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
import {
  useDeleteEventByIdMutation,
  useHardDeleteEventByIdMutation,
} from '../state/events-api-slice';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DeleteEventDialog({
  eventId,
  open,
  onOpenChange,
  children,
}: {
  eventId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const [deleteEvent] = useDeleteEventByIdMutation();

  const handleDelete = async () => {
    try {
      await deleteEvent({ eventId }).unwrap();
      toast.success('Successfully moved event to trash.');
    } catch (error: any) {
      console.error(error);
      toast.error(error.data.message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent size='sm'>
        <AlertDialogHeader>
          <AlertDialogMedia className='bg-destructive/10 text-destructive size-12'>
            <Trash2 className='size-6' />
          </AlertDialogMedia>
          <AlertDialogTitle>Move event to trash?</AlertDialogTitle>
          <AlertDialogDescription>
            The event will be archived and can be retrieved again later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDelete()} variant={'destructive'}>
            Hell yeah.
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function HardDeleteEventDialog({
  eventId,
  children,
}: {
  eventId: string;
  children?: React.ReactNode;
}) {
  const [deleteEvent] = useHardDeleteEventByIdMutation();
  const [isOpen, setIsOpen] = useState(false);

  const [countdown, setCountdown] = useState(5);

  // Reset countdown to 3 whenever the dialog opens
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
      await deleteEvent({ eventId }).unwrap();
      toast.success('Deleted event successfully.');
    } catch (error: any) {
      console.error(error);
      toast.error(error.data.message);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent className='w-md'>
        <AlertDialogHeader>
          <AlertDialogMedia className='bg-destructive/10 text-destructive size-12'>
            <Trash2 className='size-6' />
          </AlertDialogMedia>
          <AlertDialogTitle>Permanently delete this event?</AlertDialogTitle>
          <AlertDialogDescription>
            Once you go screaming over the edge, it's all over. Ain't no coming
            back, choom. PERMANENTLY delete this event?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDelete()}
            variant={'destructive'}
            disabled={countdown > 0}
          >
            {countdown > 0 ? `Wait ${countdown}s` : 'DELETE'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
