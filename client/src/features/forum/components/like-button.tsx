import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useForumSession } from '../hooks/use-forum-session';

type LikeState = { count: number; liked: boolean };

/**
 * The one piece of colour in the feed. Liking never invalidates the post cache
 * — that would refetch an infinite feed and throw away the reader's place — so
 * the button shows an optimistic value and settles on the counts the server
 * returns.
 */
export function LikeButton({
  likeCount,
  likedByMe,
  onLike,
  onUnlike,
  label,
  className,
}: {
  likeCount: number;
  likedByMe: boolean;
  onLike: () => Promise<LikeState>;
  onUnlike: () => Promise<LikeState>;
  label: string;
  className?: string;
}) {
  const { requireAuth } = useForumSession();
  const [optimistic, setOptimistic] = useState<LikeState | null>(null);
  const [isPending, setIsPending] = useState(false);

  // When the server sends a fresh count, it wins over anything held locally.
  const serverState = `${likeCount}:${likedByMe}`;
  const lastServerState = useRef(serverState);

  if (lastServerState.current !== serverState) {
    lastServerState.current = serverState;
    setOptimistic(null);
  }

  const liked = optimistic?.liked ?? likedByMe;
  const count = optimistic?.count ?? likeCount;

  const handleClick = async () => {
    if (!requireAuth() || isPending) return;

    const next = { count: liked ? count - 1 : count + 1, liked: !liked };

    setOptimistic(next);
    setIsPending(true);

    try {
      setOptimistic(liked ? await onUnlike() : await onLike());
    } catch (error: any) {
      setOptimistic(null);
      toast.error(error?.data?.message ?? 'Could not save that like');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? `Unlike ${label}` : `Like ${label}`}
      className={cn(
        'text-muted-foreground gap-1.5 px-2',
        liked && 'text-primary hover:text-primary',
        className,
      )}
    >
      <Heart className={cn('size-4', liked && 'fill-current')} />
      <span className='font-mono text-xs'>{count}</span>
    </Button>
  );
}
