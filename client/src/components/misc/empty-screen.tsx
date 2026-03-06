import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

export function ComingSoonEmpty({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex h-fit w-md flex-col', className)}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='default'>
            <img src='/coming-soon.png' />
          </EmptyMedia>
          <EmptyTitle>Coming soon...</EmptyTitle>
          <EmptyDescription>
            This is a work in progress, please hang tight!
          </EmptyDescription>
        </EmptyHeader>
        {children && <EmptyContent>{children}</EmptyContent>}
      </Empty>
    </div>
  );
}
