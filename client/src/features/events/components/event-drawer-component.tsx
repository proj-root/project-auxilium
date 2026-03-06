import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ComingSoonEmpty } from '@/components/misc/empty-screen';
import { useState } from 'react';
import { ChevronsRight } from 'lucide-react';
import type { Event } from '../events.dto';

// This is a wrapper component for the Event Items in the many views to create a drawer on clicking the gallery item.
export function EventItemDrawer({
  children,
  className,
  event,
}: {
  children: React.ReactNode;
  className?: string;
  event: Omit<Event, 'eventReports'>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer direction='right' open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger className={cn('cursor-pointer text-start', className)}>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <ChevronsRight
            onClick={() => setIsOpen(false)}
            className='text-muted-foreground size-6 cursor-pointer'
          />
          <h1 className='text-3xl font-bold'>{event.name}</h1>
        </DrawerHeader>
        {/* TODO: Display report info etc here */}
        <div className='flex h-full w-full flex-col items-center justify-center'>
          <ComingSoonEmpty className='w-full' />
        </div>
        <DrawerFooter>
          <DrawerClose>
            <Button variant='outline'>Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}