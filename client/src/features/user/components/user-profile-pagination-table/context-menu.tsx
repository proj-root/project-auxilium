import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import type { DataTableContextMenuProps } from '@/components/ui/data-table';
import type { UserProfileDTO } from '../../user.dto';
import { Copy, Edit2, Trash2 } from 'lucide-react';
import { useDeleteUserProfileByIdMutation } from '../../state/user-api-slice';
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
import { EditUserProfileModal } from '../edit-user-form';

export function UserProfilePaginationContextMenu({
  row,
  trigger,
}: DataTableContextMenuProps<UserProfileDTO>) {
  const [deleteUserProfile] = useDeleteUserProfileByIdMutation();

  // Dialog State
  const [activeDialog, setActiveDialog] = useState<'edit' | 'delete' | null>(
    null,
  );

  const handleDelete = async () => {
    try {
      await deleteUserProfile({ profileId: row.profileId }).unwrap();
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
            onClick={() => navigator.clipboard.writeText(row.profileId)}
            className='cursor-pointer gap-2'
          >
            <Copy /> Copy ID
          </ContextMenuItem>
          <ContextMenuItem
            className='cursor-pointer gap-2'
            onSelect={() => setActiveDialog('edit')}
          >
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

      {/* Edit Dialog */}
      <EditUserProfileModal
        profileId={row.profileId}
        onSubmitCb={() => setActiveDialog(null)}
        open={activeDialog === 'edit'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      />

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
            <AlertDialogTitle>
              Delete user profile PERMANENTLY?
            </AlertDialogTitle>
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
