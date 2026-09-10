import { Lock } from 'lucide-react';

/**
 * What a visitor gets in place of the body when someone has locked their
 * profile. Deliberately a plain statement rather than an error: the account is
 * fine, it just isn't on show.
 */
export function PrivateProfile() {
  return (
    <div className='flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-center'>
      <Lock className='text-muted-foreground mb-1 size-10' />
      <h2 className='text-xl'>This profile is private</h2>
      <p className='text-muted-foreground text-sm'>
        This user has chosen not to share their profile
      </p>
    </div>
  );
}
