import { BackButton } from '@/components/misc/back-button';
import { ComingSoonEmpty } from '@/components/misc/empty-screen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventReportDataTable } from '@/features/events/components/event-reports';
import { GenerateEventReportButton } from '@/features/events/components/gen-event-report-btn';
import { EventDetailsCard } from '@/features/events/components/single-event-details';
import { useGetEventByIdQuery } from '@/features/events/state/events-api-slice';
import { Boxes, FileText, Target } from 'lucide-react';
import { useParams } from 'react-router';

export default function SingleEventDetailsPage() {
  const { eventId } = useParams();
  const { data } = useGetEventByIdQuery({ eventId: eventId ?? '' });

  if (!data || !data.data)
    return (
      <div className='flex h-full w-full items-center justify-center'>
        {/* TODO: Add Sede empty state */}
        <h1 className='text-4xl font-bold'>Where is my event???</h1>
      </div>
    );

  return (
    <div className='flex h-full w-full flex-col gap-2'>
      <BackButton />
      <div className='flex flex-row items-start justify-between'>
        <div>
          <h1 className='text-3xl font-semibold'>{data?.data.name}</h1>
          <p className='text-muted-foreground'>{data?.data.description}</p>
        </div>
        <GenerateEventReportButton event={data?.data} />
      </div>
      <EventDetailsCard
        event={data.data}
        className='w-full md:w-1/2 2xl:w-1/4'
      />
      {/* TODO: Convert into reusable component */}
      <div className='flex h-full w-full flex-col'>
        <Tabs defaultValue={'reports'} className='flex flex-col gap-4'>
          <div className='w-full border-b bg-transparent'>
            <TabsList className='inline-flex flex-row justify-start gap-2 rounded-none border-0 bg-transparent p-0'>
              <TabsTrigger
                value={'reports'}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
              >
                <FileText /> Reports
              </TabsTrigger>
              <TabsTrigger
                value={'progress'}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
              >
                <Target /> Progress
              </TabsTrigger>
              <TabsTrigger
                value={'resources'}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
              >
                <Boxes /> Resources
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Reports */}
          <TabsContent value={'reports'}>
            <div className='flex h-[calc(70vh-120px)] w-full flex-col'>
              <EventReportDataTable event={data.data} />
            </div>
          </TabsContent>

          <TabsContent
            value={'progress'}
            className='flex flex-col items-center justify-center'
          >
            <ComingSoonEmpty />
          </TabsContent>

          <TabsContent
            value={'resources'}
            className='flex flex-col items-center justify-center'
          >
            <ComingSoonEmpty />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
