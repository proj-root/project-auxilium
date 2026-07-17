import HolographicLotus from '@/components/decorative/holographic-lotus-flower';
import { InitialisingScreen } from '@/components/decorative/initialising-screen';
import TypewriterEffect from '@/components/decorative/typewriter';
import { NavBar } from '@/components/navigation/navbar';
import { useInitAnimPreference } from '@/hooks/use-initialise-anim-settings';
import { cn } from '@/lib/utils';
import { Dot, Sparkle } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

function StripedSeparator() {
  return (
    <div className='flex min-h-10 w-full items-center gap-1 overflow-hidden border-y px-4 font-mono tracking-widest text-nowrap'>
      {Array.from({ length: 8 }).map((_, i) => {
        return (
          <p className='me-2 flex items-center'>
            <Sparkle className='me-3 size-4' /> /// <Dot /> GARDEN TERMINAL{' '}
            <Dot /> ///
          </p>
        );
      })}
    </div>
  );
}

function HeroSection() {
  return (
    <div className='flex min-h-[92vh] flex-col items-center justify-center px-6 py-4'>
      <TypewriterEffect
        text='GARDEN'
        interval={0.2}
        className='font-headline text-[64px] md:text-[130px]'
      />
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
        </div>
      )}
    </div>
  );
}
