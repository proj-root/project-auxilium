import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface GridBackgroundProps {
  size?: number;
  className?: string;
}

export function GridBackground({ size = 35, className }: GridBackgroundProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className={cn('pointer-events-none absolute inset-0', className)}>
      <svg width='100%' height='100%' xmlns='http://w3.org'>
        <defs>
          <pattern
            id='grid-pattern'
            width={size}
            height={size}
            patternUnits='userSpaceOnUse'
          >
            <path
              d={`M ${size} 0 L 0 0 0 ${size}`}
              fill='none'
              stroke={resolvedTheme === 'dark' ? '#212121' : '#C4C4C4'}
              strokeWidth='1'
            />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='url(#grid-pattern)' />
      </svg>
    </div>
  );
}
