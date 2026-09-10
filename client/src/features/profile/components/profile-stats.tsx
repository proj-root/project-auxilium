import { format } from 'date-fns';

/**
 * Posts, comments and join date, set in the mono face the forum uses for
 * timestamps and counts — this is chrome about the person, not their writing.
 */
export function ProfileStats({
  postCount,
  commentCount,
  joinedAt,
}: {
  postCount: number;
  commentCount: number;
  joinedAt: string;
}) {
  return (
    <dl className='flex flex-row flex-wrap items-center gap-x-8 gap-y-3'>
      <Stat label='Posts' value={postCount.toLocaleString()} />
      <Stat label='Comments' value={commentCount.toLocaleString()} />
      <Stat label='Joined' value={format(new Date(joinedAt), 'MMM yyyy')} />
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-0.5'>
      <dt className='text-muted-foreground font-mono text-xs tracking-wide uppercase'>
        {label}
      </dt>
      <dd className='font-mono text-sm'>{value}</dd>
    </div>
  );
}
