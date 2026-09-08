import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useForumSession } from '../hooks/use-forum-session';
import {
  useCreateCommentMutation,
  useUpdateCommentMutation,
} from '../state/forum-api-slice';

/**
 * The writing surface shared by new comments, replies, and edits — a bare
 * textarea rather than a bordered input, so it reads as writing in place
 * rather than as a form that opened.
 */
function CommentForm({
  initialText = '',
  placeholder,
  submitLabel,
  isSubmitting,
  autoFocus,
  onSubmit,
  onCancel,
  className,
}: {
  initialText?: string;
  placeholder: string;
  submitLabel: string;
  isSubmitting: boolean;
  autoFocus?: boolean;
  onSubmit: (text: string) => Promise<boolean>;
  onCancel?: () => void;
  className?: string;
}) {
  const [text, setText] = useState(initialText);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!text.trim() || isSubmitting) return;

    if (await onSubmit(text.trim())) {
      setText('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-full flex-col gap-2 rounded-md border py-2',
        className,
      )}
    >
      <textarea
        value={text}
        autoFocus={autoFocus}
        rows={3}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => setText(event.target.value)}
        className='resize-none px-4 text-sm/relaxed outline-0'
      />
      <div className='flex flex-row justify-end gap-2 px-3'>
        {onCancel && (
          <Button
            type='button'
            size='sm'
            variant='secondary'
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type='submit' size='sm' disabled={!text.trim() || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className='animate-spin' /> Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

/** Writes a new top-level comment, or a reply when given a parent. */
export function CommentComposer({
  postId,
  parentCommentId,
  autoFocus,
  onCancel,
  onSubmitted,
  className,
}: {
  postId: string;
  parentCommentId?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  onSubmitted?: () => void;
  className?: string;
}) {
  const { requireAuth } = useForumSession();
  const [createComment, { isLoading }] = useCreateCommentMutation();

  const handleSubmit = async (text: string) => {
    if (!requireAuth()) return false;

    try {
      await createComment({ postId, parentCommentId, text }).unwrap();
      onSubmitted?.();

      return true;
    } catch (error: any) {
      console.error('CommentComposer Error:', error);
      toast.error(error?.data?.message ?? 'Could not post that comment');

      return false;
    }
  };

  return (
    <CommentForm
      placeholder={parentCommentId ? 'Write a reply' : 'Add a comment'}
      submitLabel={parentCommentId ? 'Reply' : 'Comment'}
      isSubmitting={isLoading}
      autoFocus={autoFocus}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      className={className}
    />
  );
}

/** Rewrites an existing comment in place, on the spot where it is displayed. */
export function CommentEditForm({
  commentId,
  initialText,
  onCancel,
  onSaved,
}: {
  commentId: string;
  initialText: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [updateComment, { isLoading }] = useUpdateCommentMutation();

  const handleSubmit = async (text: string) => {
    try {
      await updateComment({ commentId, text }).unwrap();
      onSaved();

      return true;
    } catch (error: any) {
      console.error('CommentEditForm Error:', error);
      toast.error(error?.data?.message ?? 'Could not save that comment');

      return false;
    }
  };

  return (
    <CommentForm
      initialText={initialText}
      placeholder='Edit your comment'
      submitLabel='Save'
      isSubmitting={isLoading}
      autoFocus
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
