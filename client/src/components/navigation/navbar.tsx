// import { UserProfileDropdown } from '@/features/user/components/profile-dropdown';
import { Separator } from '@/components/ui/separator';
import { ThemeToggler } from '../misc/theme-toggler';
import { Button } from '../ui/button';
import { Link } from 'react-router';
import { UserProfileDropdown } from '@/features/user/components/profile-dropdown';
import { authClient } from '@/lib/auth-client';
import { useTheme } from 'next-themes';
import { motion, stagger, type Variants } from 'motion/react';

interface NavBarProps {
  isParentLoading: boolean;
}

export function NavBar({ isParentLoading }: NavBarProps) {
  const { resolvedTheme } = useTheme();
  const { data, isPending, error } = authClient.useSession();

  const navVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: stagger(0.1, { startDelay: 0.2 }),
      },
    },
  };

  const navItemVariants: Variants = {
    hidden: { y: -40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className='z-11 bg-background flex flex-row items-center justify-between px-6 py-3 sticky top-0'>
      <motion.div
        animate={!isParentLoading && { x: 0, opacity: 1 }}
        initial={{ x: -50, opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Link to='/'>
          <img
            src={
              resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'
            }
            className='h-15 w-45 object-cover'
          />
        </Link>
      </motion.div>

      <motion.nav
        initial={'hidden'}
        animate={isParentLoading ? 'hidden' : 'visible'}
        variants={navVariants}
        className='text-muted-foreground flex flex-row justify-evenly gap-16 font-mono text-lg'
      >
        <motion.div variants={navItemVariants}>
          <Link
            to={'/events'}
            className='hover:text-foreground transition-colors duration-100 ease-in'
          >
            / events
          </Link>
        </motion.div>
        <motion.div variants={navItemVariants}>
          <Link
            to={'/events'}
            className='hover:text-foreground transition-colors duration-100 ease-in'
          >
            / resources
          </Link>
        </motion.div>
        <motion.div variants={navItemVariants}>
          <Link
            to={'/events'}
            className='hover:text-foreground transition-colors duration-100 ease-in'
          >
            / forum
          </Link>
        </motion.div>
        <motion.div variants={navItemVariants}>
          <Link
            to={'/events'}
            className='hover:text-foreground transition-colors duration-100 ease-in'
          >
            / about
          </Link>
        </motion.div>
      </motion.nav>
      <motion.div
        animate={!isParentLoading && { x: 0, opacity: 1 }}
        initial={{ x: 50, opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className='flex flex-row items-center gap-3'
      >
        <ThemeToggler />
        {/* <NotificationButton /> */}

        <Separator
          orientation='vertical'
          className='border-muted border-l-[0.5px] data-[orientation=vertical]:h-8'
        />

        {!data && !isPending ? (
          <div className='flex flex-row gap-2'>
            <Button asChild size={'sm'}>
              <Link to={'/auth/login'}>Login</Link>
            </Button>
            <Button asChild size={'sm'} variant={'secondary'}>
              <Link to={'/auth/register'}>Register</Link>
            </Button>
          </div>
        ) : (
          <UserProfileDropdown />
        )}
      </motion.div>
    </div>
  );
}
