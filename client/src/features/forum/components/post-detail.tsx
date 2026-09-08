import { BackButton } from '@/components/misc/back-button';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { COMMENT_SORTS, type CommentSort } from '../forum.dto';
import { useGetPostByIdQuery } from '../state/forum-api-slice';
import { AuthorLine } from './author-line';
import { CommentComposer } from './comment-form';
import { CommentList } from './comment-thread';
import { PostActions } from './post-actions';
import { PostBody } from './post-body';

const COMMENT_SORT_LABELS: Record<CommentSort, string> = {
  top: 'Top',
  new: 'New',
};

export function PostDetail({ postId }: { postId: string }) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetPostByIdQuery({ postId });
  const [commentSort, setCommentSort] = useState<CommentSort>('top');

  if (isLoading) {
    return (
      <div className='flex w-full max-w-3xl flex-col gap-4 py-6'>
        <Skeleton className='h-9 w-3/4 rounded-md' />
        <div className='flex flex-row items-center gap-2'>
          <Skeleton className='size-6 rounded-full' />
          <Skeleton className='h-4 w-28 rounded-md' />
        </div>
        <Skeleton className='h-4 w-full rounded-md' />
        <Skeleton className='h-4 w-full rounded-md' />
        <Skeleton className='h-4 w-2/3 rounded-md' />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className='flex w-full flex-col items-center justify-center gap-6 py-16'>
        <img src='/not-found.png' alt='Post not found' className='max-w-sm' />
        <div className='flex flex-col items-center gap-1'>
          <p className='text-2xl'>This post is gone</p>
          <p className='text-muted-foreground'>
            It may have been deleted by its author
          </p>
        </div>
        <Button variant='outline' asChild>
          <Link to='/forum'>Back to the forum</Link>
        </Button>
      </div>
    );
  }

  const post = data.data;

  return (
    <div className='flex w-full max-w-3xl flex-col gap-4 py-6'>
      <BackButton />

      <article className='flex flex-col gap-3'>
        <h1 className='text-3xl leading-tight font-semibold'>{post.title}</h1>
        <AuthorLine
          creator={post.creator}
          createdAt={post.createdAt}
          updatedAt={post.updatedAt}
        />
        <PostBody
          text={post.content}
          className='max-w-[68ch] text-base/relaxed'
        />
        <PostActions
          post={post}
          onDeleted={() => navigate('/forum')}
          className='-ms-2'
        />
      </article>

      <Separator />

      <CommentComposer postId={postId} />

      <div className='flex flex-row items-center gap-1'>
        {COMMENT_SORTS.map((sort) => (
          <Button
            key={sort}
            variant='ghost'
            size='sm'
            onClick={() => setCommentSort(sort)}
            aria-pressed={commentSort === sort}
            className={cn(
              'text-muted-foreground px-2 font-mono text-xs',
              commentSort === sort && 'text-foreground',
            )}
          >
            {COMMENT_SORT_LABELS[sort]}
          </Button>
        ))}
      </div>

      <CommentList postId={postId} sort={commentSort} />
    </div>
  );
}
