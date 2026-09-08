import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageSquare, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import type { Post } from '../forum.dto';
import { useForumSession } from '../hooks/use-forum-session';
import {
  useDeletePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
} from '../state/forum-api-slice';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';
import { EditPostDialog } from './edit-post-dialog';
import { LikeButton } from './like-button';
import { OwnerMenu } from './owner-menu';
import { SharePostDialog } from './share-post-dialog';

/**
 * The control row under a post. Every dialog it can open is rendered here as a
 * sibling of the menu rather than inside it, because the menu unmounts the
 * moment an item is chosen.
 */
export function PostActions({
  post,
  commentsHref,
  onDeleted,
  className,
}: {
  post: Post;
  // When set, the comment count links through to the post instead of being
  // inert — the feed wants a link, the post page does not.
  commentsHref?: string;
  onDeleted?: () => void;
  className?: string;
}) {
  const { userId, canModerate } = useForumSession();
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [deletePost] = useDeletePostMutation();

  const [isSharing, setIsSharing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isAuthor = Boolean(userId) && userId === post.createdBy;

  const handleDelete = async () => {
    try {
      await deletePost({ postId: post.postId }).unwrap();
      toast.success('Post deleted');
      onDeleted?.();
    } catch (error: any) {
      console.error('PostActions Error:', error);
      toast.error(error?.data?.message ?? 'Could not delete that post');
    }
  };

  const commentCount = (
    <>
      <MessageSquare className='size-4' />
      <span className='font-mono text-xs'>{post.commentCount}</span>
    </>
  );

  return (
    <div className={cn('flex flex-row items-center gap-1', className)}>
      <LikeButton
        likeCount={post.likeCount}
        likedByMe={post.likedByMe}
        label='this post'
        onLike={async () =>
          mapLike(await likePost({ postId: post.postId }).unwrap())
        }
        onUnlike={async () =>
          mapLike(await unlikePost({ postId: post.postId }).unwrap())
        }
      />

      {commentsHref ? (
        <Button
          variant='ghost'
          size='sm'
          className='text-muted-foreground gap-1.5 px-2'
          asChild
        >
          <Link to={commentsHref} aria-label={`${post.commentCount} comments`}>
            {commentCount}
          </Link>
        </Button>
      ) : (
        <div
          className='text-muted-foreground flex flex-row items-center gap-1.5 px-2 text-sm'
          aria-label={`${post.commentCount} comments`}
        >
          {commentCount}
        </div>
      )}

      <Button
        variant='ghost'
        size='sm'
        className='text-muted-foreground gap-1.5 px-2'
        onClick={() => setIsSharing(true)}
        aria-label='Share this post'
      >
        <Share2 className='size-4' />
        <span className='hidden sm:inline'>Share</span>
      </Button>

      <div className='ms-auto'>
        <OwnerMenu
          subject='Post'
          canEdit={isAuthor}
          canDelete={isAuthor || canModerate}
          onEdit={() => setIsEditing(true)}
          onDelete={() => setIsConfirmingDelete(true)}
        />
      </div>

      <SharePostDialog
        postId={post.postId}
        open={isSharing}
        onOpenChange={setIsSharing}
      />
      <EditPostDialog
        post={post}
        open={isEditing}
        onOpenChange={setIsEditing}
      />
      <ConfirmDeleteDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        onConfirm={handleDelete}
        title='Delete this post?'
        description='It will be removed from the forum. Anyone holding a link to it will no longer be able to read it.'
        confirmLabel='Delete post'
      />
    </div>
  );
}

function mapLike(response: {
  data: { likeCount: number; likedByMe: boolean };
}) {
  return { count: response.data.likeCount, liked: response.data.likedByMe };
}
