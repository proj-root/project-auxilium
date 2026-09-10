import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createUserInitials } from '@/lib/formatters';
import { Lock, Settings2 } from 'lucide-react';
import { Link } from 'react-router';
import type { PublicProfile } from '../profile.dto';
import { ProfileCover } from './profile-cover';

/**
 * Cover, avatar and identity. The avatar straddles the cover's lower edge —
 * it belongs to neither band, which is what makes the seam read as one object
 * rather than two stacked ones.
 *
 * Rendered for private profiles too: name and avatar are already public in the
 * forum, and withholding them here would only leave a visitor wondering whose
 * page they had opened.
 */
export function ProfileHeader({ profile }: { profile: PublicProfile }) {
  const { name, image, details, isSelf, isPrivate } = profile;
  const course = details?.course;

  return (
    <div className='flex flex-col'>
      <ProfileCover />

      <div className='flex flex-row items-end justify-between gap-4 px-1'>
        <Avatar className='ring-background bg-background -mt-12 size-24 ring-4 sm:-mt-14 sm:size-28'>
          {image && <AvatarImage src={image} alt={name} />}
          <AvatarFallback className='text-2xl'>
            {createUserInitials(name)}
          </AvatarFallback>
        </Avatar>

        {isSelf && (
          <Button variant='outline' size='sm' asChild>
            <Link to='/settings'>
              <Settings2 /> Edit profile
            </Link>
          </Button>
        )}
      </div>

      <div className='mt-4 flex flex-col gap-2'>
        <div className='flex flex-row flex-wrap items-center gap-2'>
          <h1 className='text-3xl font-semibold break-words'>{name}</h1>
          {/* Only the owner ever sees this alongside their details — everyone
              else gets the lock screen, where the badge would be redundant. */}
          {isSelf && isPrivate && (
            <Badge variant='secondary' className='font-mono'>
              <Lock /> Private
            </Badge>
          )}
        </div>

        {course && (
          <div className='flex flex-row flex-wrap items-center gap-2'>
            <Badge variant='outline' className='font-mono'>
              {course.code}
            </Badge>
            <span className='text-muted-foreground text-sm'>{course.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
