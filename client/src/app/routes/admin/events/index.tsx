import { ComingSoonEmpty } from '@/components/misc/empty-screen';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventsGalleryView } from '@/features/events/components/event-gallery';
import { Calendar, LayoutGrid, MoreHorizontal, Table2 } from 'lucide-react';
import { useSearchParams } from 'react-router';

export default function AllEventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-4 flex flex-col'>
        <h1 className='text-3xl font-semibold'>All Events</h1>
        <p className='text-muted-foreground'>
          View all event information and the overall timeline.
        </p>
      </div>
      <Tabs defaultValue={'gallery'} className='flex h-full flex-col gap-4'>
        <div className='w-full border-b bg-transparent'>
          <TabsList className='inline-flex flex-row justify-start gap-2 rounded-none border-0 bg-transparent p-0'>
            <TabsTrigger
              value={'gallery'}
              className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
            >
              <LayoutGrid /> Gallery
            </TabsTrigger>
            <TabsTrigger
              value={'table'}
              className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
            >
              <Table2 /> Table
            </TabsTrigger>
            <TabsTrigger
              value={'calendar'}
              className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
            >
              <Calendar /> Calendar
            </TabsTrigger>
            <Button
              variant={'ghost'}
              size={'icon-sm'}
              className='hover:bg-transparent!'
              title={`This button doesn't actually do anything`}
            >
              <MoreHorizontal />
            </Button>
          </TabsList>
        </div>

        <TabsContent value={'gallery'}>
          <EventsGalleryView />
        </TabsContent>
        <TabsContent
          value={'calendar'}
          className='flex h-full flex-col items-center justify-center'
        >
          <ComingSoonEmpty />
        </TabsContent>
        <TabsContent
          value={'table'}
          className='flex h-full flex-col items-center justify-center'
        >
          <ComingSoonEmpty />
        </TabsContent>
      </Tabs>
    </div>
  );
}
