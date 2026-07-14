import { ComingSoonEmpty } from '@/components/misc/empty-screen';
import { cn } from '@/lib/utils';

export function EventTeamList({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex w-full h-full flex-col gap-3',
        className,
      )}
    >
      <h1 className='mt-2 text-xl font-medium'>Organising Team</h1>
      <div className='rounded-xl border border-dashed'>
        <ComingSoonEmpty className='object-fit'/>
      </div>
    </div>
  );
}
