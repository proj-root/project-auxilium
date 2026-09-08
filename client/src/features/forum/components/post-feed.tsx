import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Search, Sprout } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  type GetAllPostsRequest,
  type Post,
  type PostSort,
  POST_SORTS,
} from '../forum.dto';
import { useInfiniteScroll } from '../hooks/use-infinite-scroll';
import { useGetAllPostsQuery } from '../state/forum-api-slice';
import { ForumSortTabs } from './forum-sort-tabs';
import { PostCard } from './post-card';
import { PostComposer } from './post-composer';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

// 'latest' is the UI's word for the server's newest-first ordering; 'hot' and
// 'top' are computed there from like counts.
const SORT_FIELDS: Record<PostSort, GetAllPostsRequest['sortBy']> = {
  latest: 'createdAt',
  hot: 'hot',
  top: 'top',
};

export function PostFeed() {
  const [searchParams, setSearchParams] = useSearchParams();

  const sortParam = searchParams.get('sort') as PostSort | null;
  const sort: PostSort =
    sortParam && POST_SORTS.includes(sortParam) ? sortParam : 'latest';
  const search = searchParams.get('q') ?? '';

  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState(search);

  // A new ordering or a new search is a new feed, so start at the top of it.
  useEffect(() => {
    setPage(1);
  }, [sort, search]);

  useEffect(() => {
    if (searchDraft === search) return;

    const timer = setTimeout(() => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);

          if (searchDraft) {
            next.set('q', searchDraft);
          } else {
            next.delete('q');
          }

          return next;
        },
        { replace: true },
      );
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchDraft, search, setSearchParams]);

  const { data, isLoading, isFetching, isError } = useGetAllPostsQuery({
    page,
    pageSize: PAGE_SIZE,
    sortBy: SORT_FIELDS[sort],
    sortOrder: 'desc',
    search: search || undefined,
  });

  const posts = data?.data.posts ?? [];
  const hasMore = page < (data?.data.pageCount ?? 0);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: () => setPage((current) => current + 1),
    hasMore,
    isLoading: isFetching,
  });

  const setSort = (next: PostSort) =>
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);

      if (next === 'latest') {
        params.delete('sort');
      } else {
        params.set('sort', next);
      }

      return params;
    });

  return (
    <div className='flex w-full max-w-3xl flex-col gap-4 py-6'>
      <div className='flex flex-col gap-3'>
        <div className='flex flex-row items-center justify-between gap-4'>
          <h1 className='text-2xl font-semibold'>Forum</h1>
          <div className='relative w-full max-w-xs'>
            <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
            <Input
              type='search'
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder='Search posts'
              aria-label='Search posts'
              className='ps-8'
            />
          </div>
        </div>
        <ForumSortTabs value={sort} onChange={setSort} />
      </div>

      <PostComposer />

      <FeedBody
        posts={posts}
        isLoading={isLoading}
        isError={isError}
        search={search}
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

function FeedBody({
  posts,
  isLoading,
  isError,
  search,
}: {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  search: string;
}) {
  // Error state
  if (!isLoading && isError) {
    return (
      <div className='flex w-full flex-col items-center justify-center gap-4 py-10'>
        <img src='/not-found.png' alt='An error occurred' className='w-1/3' />
        <div className='flex flex-col items-center'>
          <p className='text-2xl'>The forum did not load...</p>
          <p className='text-muted-foreground'>Welp that&apos;s on me</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && posts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed p-10'>
        <Sprout className='mb-2 size-10' />
        <div className='flex flex-col items-center'>
          <h2 className='text-xl'>
            {search ? 'Nothing matched that' : 'Nothing here yet...'}
          </h2>
          <p className='text-muted-foreground'>
            {search
              ? 'Try a different word'
              : 'Be the first to start a conversation'}
          </p>
        </div>
      </div>
    );
  }

  // Normal state
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

  // Loading state
  return (
    <div className='flex flex-col gap-2'>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className='flex flex-col gap-2 px-3 py-3'>
          <div className='flex flex-row items-center gap-2'>
            <Skeleton className='size-6 rounded-full' />
            <Skeleton className='h-4 w-24 rounded-md' />
            <Skeleton className='h-3 w-16 rounded-md' />
          </div>
          <Skeleton className='h-6 w-2/3 rounded-md' />
          <Skeleton className='h-4 w-full rounded-md' />
          <Skeleton className='h-4 w-5/6 rounded-md' />
          <div className='flex flex-row gap-2 pt-1'>
            <Skeleton className='h-7 w-14 rounded-md' />
            <Skeleton className='h-7 w-14 rounded-md' />
            <Skeleton className='h-7 w-20 rounded-md' />
          </div>
          <Separator className='my-1' />
        </div>
      ))}
    </div>
  );
}
