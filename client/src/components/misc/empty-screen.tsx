import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export function ComingSoonEmpty({ children }: { children?: React.ReactNode }) {
  return (
    <div className='flex h-fit w-md flex-col'>
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
