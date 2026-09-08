import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react';

/**
 * The three-dot menu on a post or comment. The author gets Edit and Delete;
 * an admin gets Delete alone on someone else's writing. Everyone else sees
 * nothing at all.
 */
export function OwnerMenu({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  subject,
}: {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  subject: string;
}) {
  if (!canEdit && !canDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon-sm'
          className='text-muted-foreground'
          aria-label={`${subject} options`}
        >
          <EllipsisVertical className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-36'>
        {canEdit && (
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil /> Edit
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem variant='destructive' onSelect={onDelete}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
