import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createUserInitials, formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Creator } from '../forum.dto';

// $onUpdate stamps updatedAt on insert too, so a second of slack keeps freshly
// created rows from claiming they were edited.
const EDIT_THRESHOLD_MS = 2000;

/**
 * Who wrote this and when. Metadata is set in the mono face and separated by
 * spacing rather than punctuation, so it reads as chrome next to the writing.
 */
export function AuthorLine({
  creator,
  createdAt,
  updatedAt,
  className,
}: {
  creator: Creator | null;
  createdAt: string;
  updatedAt: string;
  className?: string;
}) {
  const name = creator?.name ?? '[deleted]';
  const isEdited =
    new Date(updatedAt).getTime() - new Date(createdAt).getTime() >
    EDIT_THRESHOLD_MS;

  return (
    <div className={cn('flex flex-row items-center gap-2', className)}>
      <Avatar className='size-6'>
        {creator?.image && <AvatarImage src={creator.image} alt={name} />}
        <AvatarFallback className='text-xs'>
          {createUserInitials(name)}
        </AvatarFallback>
      </Avatar>
      <span className='text-sm font-medium'>{name}</span>
      <span className='text-muted-foreground font-mono text-xs'>
        {formatRelativeTime(createdAt)}
      </span>
      {isEdited && (
        <span className='text-muted-foreground font-mono text-xs'>edited</span>
      )}
    </div>
  );
}
