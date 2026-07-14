import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import type { DataTableContextMenuProps } from '@/components/ui/data-table';
import type { UserDTO } from '../../user.dto';
import { Copy, Edit2, Trash2 } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';
import { useDeleteUserByIdMutation } from '../../state/user-api-slice';
import { toast } from 'sonner';
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
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export function UserPaginationContextMenu({
  row,
  trigger,
}: DataTableContextMenuProps<UserDTO>) {
  const [deleteUser] = useDeleteUserByIdMutation();

  const [activeDialog, setActiveDialog] = useState<'edit' | 'delete' | null>(
    null,
  );

  const handleDelete = async () => {
    try {
      await deleteUser({ userId: row.id }).unwrap();
      toast.success('Successfully deleted user profile');
    } catch (error: any) {
      console.error(error);
      toast.error(error.data.message);
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className='flex h-full w-full p-2'>
          {trigger}
        </ContextMenuTrigger>
        <ContextMenuContent className='w-48'>
          <ContextMenuItem
            onClick={() => copyToClipboard(row.id)}
            className='cursor-pointer gap-2'
          >
            <Copy /> Copy ID
          </ContextMenuItem>
          <ContextMenuItem className='cursor-pointer gap-2'>
            <Edit2 /> Edit
          </ContextMenuItem>
          <ContextMenuItem
            className='cursor-pointer gap-2'
            variant={'destructive'}
            onSelect={() => setActiveDialog('delete')}
          >
            <Trash2 /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Delete Dialog */}
      <AlertDialog
        open={activeDialog === 'delete'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <AlertDialogContent size={'sm'}>
          <AlertDialogHeader>
            <AlertDialogMedia className='bg-destructive/20'>
              <Trash2 className='text-destructive' />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete user PERMANENTLY?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe not...</AlertDialogCancel>
            <AlertDialogAction
              variant={'destructive'}
              className='cursor-pointer'
              onClick={() => handleDelete()}
            >
              Yeah I'm sure.
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
