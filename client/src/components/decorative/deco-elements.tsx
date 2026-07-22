import { cn } from '@/lib/utils';

export function Barcode({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Visual Barcode Lines */}
      <div className='flex h-8 w-full justify-between'>
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className='bg-foreground'
            style={{
              width: `${Math.random() * 4 + 1}px`, // Random line widths
            }}
          />
        ))}
      </div>
      {/* Fake Barcode Number */}
      <div>
        {children}
      </div>
    </div>
  );
}
