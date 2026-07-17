import HolographicLotus from '@/components/decorative/holographic-lotus-flower';
import { InitialisingScreen } from '@/components/decorative/initialising-screen';
import TypewriterEffect from '@/components/decorative/typewriter';
import { NavBar } from '@/components/navigation/navbar';
import { Button } from '@/components/ui/button';
import { useInitAnimPreference } from '@/hooks/use-initialise-anim-settings';
import { cn } from '@/lib/utils';
import { Dot, Sparkle } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Barcode } from '@/components/decorative/deco-elements';
import { SiteFooter } from '@/components/navigation/footer';

function StripedSeparator() {
  return (
    <div
      style={{
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            #cacaca 0,
            #cacaca 1px,
            transparent 0,
            transparent 50%
          )`,
        backgroundSize: `10px 10px`,
      }}
      className='flex min-h-6 w-full items-center gap-1 overflow-hidden border-y px-4 font-mono tracking-widest text-nowrap'
    />
  );
}

function HeroSection() {
  return (
    <div className='flex h-[92vh] min-h-[92vh] flex-row items-center justify-center px-16 py-10'>
      <div className='flex h-full w-full flex-col justify-between'>
        <div className='bg-foreground h-4 w-60' />
        <div className='flex flex-col'>
          {/* <div>
            <img src="/logo.png" className='size-10'/>
          </div> */}
          <TypewriterEffect
            text='GARDEN'
            interval={0.2}
            className='font-headline text-[64px] md:h-36 md:text-[110px]'
          />
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: 'easeInOut' }}
            className='mb-6 text-xl font-medium'
          >
            Your one-stop terminal for all things SOC-related.
          </motion.p>
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: 'easeInOut' }}
            className='flex gap-4'
          >
            <Link
              to={'/#events'}
              className='hover:bg-muted/80 border px-6 py-2'
            >
              Events
            </Link>
            <Link
              to={'/resources'}
              className='hover:bg-muted/80 border px-6 py-2'
            >
              Resources
            </Link>
          </motion.div>
        </div>
        {/* Barcode design */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: 'easeInOut' }}
        >
          <Barcode className='w-55'>
            <p className='text-xs'>GARDEN 2243 509 5331</p>
          </Barcode>
        </motion.div>
      </div>
      <div className='h-full w-full'></div>
      {/* <div className='absolute -z-0 h-full w-full overflow-hidden'>
        <HolographicLotus />
      </div> */}
      {/* <p>Generic Administrative Repository and Distributed Events Network</p> */}
    </div>
  );
}

function UpcomingEventsSection() {
  return (
    <div className='flex min-h-screen flex-col'>
      <h1>Our upcoming events</h1>
    </div>
  );
}

// TODO: Make it such that loading screen only plays once a day, never, or every time
// User can decide in settings, stored in cookie/localStorage

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { shouldPlay, markAsSeenToday, isLoaded } = useInitAnimPreference();

  useEffect(() => {
    if (isLoaded && !shouldPlay) {
      setIsLoading(false);
    }
  }, [shouldPlay]);

  if (!isLoaded) {
    return <div className='min-h-screen' />;
  }

  return (
    <div className='relative h-screen max-h-screen w-full overflow-hidden'>
      <AnimatePresence mode='wait'>
        {shouldPlay && isLoading && (
          <InitialisingScreen
            onAnimationComplete={() => {
              markAsSeenToday();
              setIsLoading(false);
            }}
          />
        )}
      </AnimatePresence>

      {!isLoading && (
        <div
          className={cn(
            'flex max-h-full w-full scrollbar-none flex-col overflow-y-scroll',
            isLoading ? 'pointer-events-none' : '',
          )}
        >
          <NavBar isParentLoading={isLoading} />
          <HeroSection />
          <StripedSeparator />
          <UpcomingEventsSection />
          <SiteFooter />
        </div>
      )}
    </div>
  );
}
