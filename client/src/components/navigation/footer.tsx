import { Link } from 'react-router';
import { Separator } from '../ui/separator';
import { useTheme } from 'next-themes';
import { FaInstagram, FaTelegramPlane, FaDiscord } from 'react-icons/fa';

export function SiteFooter() {
  const { resolvedTheme } = useTheme();

  return (
    <footer className='flex h-[50vh] min-h-[50vh] flex-col border-t px-16 py-8'>
      <div className='flex h-full'>
        <div className='flex h-full w-full flex-col'>
          <Link to={'/'} className='w-fit'>
            {/* <img
              src={
                resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'
              }
              className='h-15 w-45 object-cover'
            /> */}
            <h1 className='font-headline text-4xl'>GARDEN</h1>
          </Link>
          <p className='mt-1 text-sm'>
            Generic Administrative Repository & Distributed Events Network
          </p>
          {/* Socials */}
          <div className='mt-4 flex gap-3'>
            <Link
              to={'https://www.instagram.com/soc_seed'}
              target='_blank'
              className='transition-all duration-300 ease-in-out hover:rotate-12'
            >
              <FaInstagram className='size-6' />
            </Link>
            <Link
              to={'https://t.me/+LRdrgKQqwhQ2M2Y9'}
              target='_blank'
              className='transition-all duration-300 ease-in-out hover:rotate-12'
            >
              <FaTelegramPlane className='size-6' />
            </Link>
            <Link
              to={'https://discord.gg/gFxgGCdTz'}
              target='_blank'
              className='transition-all duration-300 ease-in-out hover:rotate-12'
            >
              <FaDiscord className='size-6' />
            </Link>
          </div>
        </div>
        <div className='me-8 flex gap-30 text-nowrap'>
          <div className='flex w-fit flex-col gap-2'>
            <h1 className='text-lg font-medium'>Explore</h1>
            <Link
              to={'/events'}
              className='text-muted-foreground hover:text-foreground transition-colors duration-200'
            >
              Events
            </Link>
            <Link
              to={'/resources'}
              className='text-muted-foreground hover:text-foreground transition-colors duration-200'
            >
              Resources
            </Link>
            <Link
              to={'/forum'}
              className='text-muted-foreground hover:text-foreground transition-colors duration-200'
            >
              Forum
            </Link>
            <Link
              to={'/about'}
              className='text-muted-foreground hover:text-foreground transition-colors duration-200'
            >
              About
            </Link>
          </div>
          <div className='flex w-fit flex-col gap-2'>
            <h1 className='text-lg font-medium'>Help & Support</h1>
            <Link
              to={'/faq'}
              className='text-muted-foreground hover:text-foreground transition-colors duration-200'
            >
              FAQ
            </Link>
            <Link
              to={'https://forms.gle/8RYR5G9XzgkzeNHD7'}
              className='text-muted-foreground hover:text-foreground transition-colors duration-200'
            >
              Feedback
            </Link>
            <Link
              to={'https://forms.gle/M4mgnc5xQX7hfx9x5'}
              className='text-muted-foreground hover:text-foreground transition-colors duration-200'
            >
              Report a Bug
            </Link>
          </div>
        </div>
      </div>
      <Separator className='my-4' />
      <div className='flex justify-between'>
        <p className='flex items-center gap-3 text-sm'>
          <img src='/logo.png' className='size-6' />
          Proudly presented to you by SEED 💚
        </p>
        <p className='text-muted-foreground text-sm'>
          © 2026 SEED. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
