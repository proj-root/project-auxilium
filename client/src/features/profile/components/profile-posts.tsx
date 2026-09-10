import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCard } from '@/features/forum/components/post-card';
import type { Post } from '@/features/forum/forum.dto';
import { useInfiniteScroll } from '@/features/forum/hooks/use-infinite-scroll';
import { useGetAllPostsQuery } from '@/features/forum/state/forum-api-slice';
import { Loader2, Sprout } from 'lucide-react';
import { Fragment, useState } from 'react';

const PAGE_SIZE = 10;

/**
 * The profile body: everything this user has posted, newest first, rendered
 * with the feed's own card so a post looks the same wherever you meet it.
 *
 * The server refuses this list for a locked profile as well, so the page being
 * unlocked is not the only thing standing between a visitor and the posts.
 */
export function ProfilePosts({
  userId,
  name,
  isSelf,
}: {
  userId: string;
  name: string;
  isSelf: boolean;
}) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError } = useGetAllPostsQuery({
    page,
    pageSize: PAGE_SIZE,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    createdBy: userId,
  });

  const posts = data?.data.posts ?? [];
  const hasMore = page < (data?.data.pageCount ?? 0);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: () => setPage((current) => current + 1),
    hasMore,
    isLoading: isFetching,
  });

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-xl font-semibold'>Posts</h2>

      <PostsBody
        posts={posts}
        isLoading={isLoading}
        isError={isError}
        name={name}
        isSelf={isSelf}
      />

      {hasMore && <div ref={sentinelRef} aria-hidden />}

      {isFetching && !isLoading && (
        <div className='text-muted-foreground flex flex-row items-center justify-center gap-2 py-4 font-mono text-xs'>
          <Loader2 className='size-4 animate-spin' /> Loading more
        </div>
      )}
    </div>
  );
}

function PostsBody({
  posts,
  isLoading,
  isError,
  name,
  isSelf,
}: {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  name: string;
  isSelf: boolean;
}) {
  if (!isLoading && isError) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center'>
        <h3 className='text-lg'>These posts did not load</h3>
        <p className='text-muted-foreground text-sm'>Welp that&apos;s on me</p>
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center'>
        <Sprout className='mb-2 size-10' />
        <h3 className='text-xl'>No posts yet</h3>
        <p className='text-muted-foreground text-sm'>
          {isSelf
            ? 'Anything you post on the forum will show up here'
            : `${name} hasn't posted anything on the forum`}
        </p>
      </div>
    );
  }

  if (!isLoading && posts.length > 0) {
    return (
      <div className='flex flex-col'>
        {posts.map((post, index) => (
          <Fragment key={post.postId}>
            {index > 0 && <Separator className='my-1' />}
            <PostCard post={post} />
          </Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-2'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='flex flex-col gap-2 px-3 py-3'>
          <div className='flex flex-row items-center gap-2'>
            <Skeleton className='size-6 rounded-full' />
            <Skeleton className='h-4 w-24 rounded-md' />
            <Skeleton className='h-3 w-16 rounded-md' />
          </div>
          <Skeleton className='h-6 w-2/3 rounded-md' />
          <Skeleton className='h-4 w-full rounded-md' />
          <Skeleton className='h-4 w-5/6 rounded-md' />
          <Separator className='my-1' />
        </div>
      ))}
    </div>
  );
}
