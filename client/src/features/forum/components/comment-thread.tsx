import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { StatusConfig } from '@auxilium/configs/status';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Comment, CommentSort } from '../forum.dto';
import { useForumSession } from '../hooks/use-forum-session';
import {
  useDeleteCommentMutation,
  useGetPostCommentsQuery,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
} from '../state/forum-api-slice';
import { AuthorLine } from './author-line';
import { CommentComposer, CommentEditForm } from './comment-form';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';
import { LikeButton } from './like-button';
import { OwnerMenu } from './owner-menu';
import { PostBody } from './post-body';

const PAGE_SIZE = 20;

// Past this many levels the indentation costs more width than the nesting is
// worth, so deeper replies keep the same inset.
const MAX_INDENT_DEPTH = 5;

/**
 * One level of a thread. The top level is fetched by the post page; each
 * deeper level is fetched only when a reader opens it, so a busy thread never
 * arrives all at once.
 */
export function CommentList({
  postId,
  parentCommentId,
  sort = 'top',
  depth = 0,
}: {
  postId: string;
  parentCommentId?: string;
  sort?: CommentSort;
  depth?: number;
}) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError } = useGetPostCommentsQuery({
    postId,
    parentCommentId,
    page,
    pageSize: PAGE_SIZE,
    // Replies are always chronological; only the top level is sortable.
    sortBy: parentCommentId
      ? 'createdAt'
      : sort === 'top'
        ? 'top'
        : 'createdAt',
    sortOrder: 'desc',
  });

  const comments = data?.data.comments ?? [];
  const hasMore = page < (data?.data.pageCount ?? 0);

  if (isLoading) {
    return (
      <div className='flex flex-col gap-3 py-2'>
        {Array.from({ length: depth === 0 ? 3 : 1 }).map((_, index) => (
          <div key={index} className='flex flex-col gap-2'>
            <div className='flex flex-row items-center gap-2'>
              <Skeleton className='size-6 rounded-full' />
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-3 w-14 rounded-md' />
            </div>
            <Skeleton className='h-4 w-4/5 rounded-md' />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className='text-muted-foreground py-2 text-sm'>
        Comments did not load. Try again in a moment.
      </p>
    );
  }

  if (comments.length === 0) {
    return depth === 0 ? (
      <p className='text-muted-foreground py-6 text-sm'>
        No comments yet. Start the conversation.
      </p>
    ) : null;
  }

  return (
    <div className='flex flex-col'>
      {comments.map((comment) => (
        <CommentItem key={comment.commentId} comment={comment} depth={depth} />
      ))}

      {hasMore && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setPage((current) => current + 1)}
          disabled={isFetching}
          className='text-muted-foreground -ms-2 w-fit px-2 font-mono text-xs'
        >
          {isFetching ? (
            <>
              <Loader2 className='animate-spin' /> Loading
            </>
          ) : (
            'Load more comments'
          )}
        </Button>
      )}
    </div>
  );
}

function CommentItem({ comment, depth }: { comment: Comment; depth: number }) {
  const { userId, canModerate, requireAuth } = useForumSession();
  const [likeComment] = useLikeCommentMutation();
  const [unlikeComment] = useUnlikeCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isDeleted = comment.statusId === StatusConfig.DELETED;
  const isAuthor =
    !isDeleted && Boolean(userId) && userId === comment.createdBy;

  const handleDelete = async () => {
    try {
      await deleteComment({ commentId: comment.commentId }).unwrap();
      toast.success('Comment deleted');
    } catch (error: any) {
      console.error('CommentItem Error:', error);
      toast.error(error?.data?.message ?? 'Could not delete that comment');
    }
  };

  return (
    <div
      className={cn('flex flex-col gap-1 py-2', depth > 0 && 'border-s ps-3')}
    >
      <AuthorLine
        creator={comment.creator}
        createdAt={comment.createdAt}
        updatedAt={comment.updatedAt}
      />

      {isEditing ? (
        <CommentEditForm
          commentId={comment.commentId}
          initialText={comment.text}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      ) : (
        <PostBody
          text={comment.text}
          className={cn(isDeleted && 'text-muted-foreground italic')}
        />
      )}

      <div className='-ms-2 flex flex-row items-center gap-1'>
        {!isDeleted && (
          <LikeButton
            likeCount={comment.likeCount}
            likedByMe={comment.likedByMe}
            label='this comment'
            onLike={async () =>
              mapLike(
                await likeComment({ commentId: comment.commentId }).unwrap(),
              )
            }
            onUnlike={async () =>
              mapLike(
                await unlikeComment({ commentId: comment.commentId }).unwrap(),
              )
            }
          />
        )}
        <Button
          variant='ghost'
          size='sm'
          className='text-muted-foreground px-2'
          onClick={() => {
            if (requireAuth()) setIsReplying((current) => !current);
          }}
        >
          Reply
        </Button>
        <div className='ms-auto'>
          <OwnerMenu
            subject='Comment'
            canEdit={isAuthor}
            canDelete={isAuthor || (canModerate && !isDeleted)}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setIsConfirmingDelete(true)}
          />
        </div>
      </div>

      {isReplying && (
        <CommentComposer
          postId={comment.postId}
          parentCommentId={comment.commentId}
          autoFocus
          onCancel={() => setIsReplying(false)}
          onSubmitted={() => {
            setIsReplying(false);
            setShowReplies(true);
          }}
        />
      )}

      {comment.replyCount > 0 && (
        <Collapsible open={showReplies} onOpenChange={setShowReplies}>
          <CollapsibleTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='text-muted-foreground -ms-2 gap-1 px-2 font-mono text-xs'
            >
              <ChevronDown
                className={cn(
                  'size-4 transition-transform',
                  showReplies && 'rotate-180',
                )}
              />
              {showReplies
                ? 'Hide replies'
                : `View ${comment.replyCount} ${
                    comment.replyCount === 1 ? 'reply' : 'replies'
                  }`}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {showReplies && (
              <CommentList
                postId={comment.postId}
                parentCommentId={comment.commentId}
                depth={Math.min(depth + 1, MAX_INDENT_DEPTH)}
              />
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      <ConfirmDeleteDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        onConfirm={handleDelete}
        title='Delete this comment?'
        description='The comment is replaced with a placeholder so any replies underneath it stay readable.'
        confirmLabel='Delete comment'
      />
    </div>
  );
}

function mapLike(response: {
  data: { likeCount: number; likedByMe: boolean };
}) {
  return { count: response.data.likeCount, liked: response.data.likedByMe };
}
