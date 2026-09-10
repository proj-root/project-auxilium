import { GridBackground } from '@/components/decorative/grid-background';
import { cn } from '@/lib/utils';

/**
 * The band behind the top of a profile.
 *
 * There is no cover image column yet — settings still lists "Profile
 * Background" as coming soon — so rather than a placeholder photo this stands
 * in with GARDEN's own furniture: a wash of the primary green over the same
 * grid the rest of the site uses, fading into the page where the avatar sits.
 */
export function ProfileCover({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'from-primary/35 via-primary/10 to-muted relative h-36 w-full overflow-hidden rounded-xl border bg-gradient-to-br sm:h-44',
        className,
      )}
    >
      <GridBackground size={35} />
      {/* Settles the grid towards the bottom edge so the avatar cutout reads
          against a quiet ground rather than a ruled one. */}
      <div className='from-background/60 absolute inset-0 bg-gradient-to-t to-transparent' />
    </div>
  );
}
