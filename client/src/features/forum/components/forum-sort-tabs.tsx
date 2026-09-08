import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { POST_SORTS, type PostSort } from '../forum.dto';

const SORT_LABELS: Record<PostSort, string> = {
  latest: 'Latest',
  hot: 'Hot',
  top: 'Top',
};

/**
 * How the feed is ordered. Set in the mono face, so the sort reads as chrome
 * rather than as another heading competing with the post titles.
 */
export function ForumSortTabs({
  value,
  onChange,
}: {
  value: PostSort;
  onChange: (sort: PostSort) => void;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as PostSort)}
      className='w-full'
    >
      <div className='w-full border-b bg-transparent'>
        <TabsList className='inline-flex flex-row justify-start gap-2 rounded-none border-0 bg-transparent p-0'>
          {POST_SORTS.map((sort) => (
            <TabsTrigger
              key={sort}
              value={sort}
              className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 font-mono hover:px-4 data-[state=active]:shadow-none!'
            >
              {SORT_LABELS[sort]}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
