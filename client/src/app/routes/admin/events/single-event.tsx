import { BackButton } from '@/components/misc/back-button';
import { ComingSoonEmpty } from '@/components/misc/empty-screen';
import { LoadingComponent } from '@/components/misc/loading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssignUserDialog } from '@/features/events/components/assign-user-dialog';
import { EditEventModal } from '@/features/events/components/edit-event-modal';
import { EventReportDataTable } from '@/features/events/components/event-reports';
import { EventSettings } from '@/features/events/components/event-settings';
import { EventTeamList } from '@/features/events/components/event-team-list';
import { GenerateEventReportButton } from '@/features/events/components/gen-event-report-btn';
import { EventDetailsCard } from '@/features/events/components/single-event-details';
import { useGetEventByIdQuery } from '@/features/events/state/events-api-slice';
import { EventTaskList } from '@/features/tasks/components/tasklist';
import { authClient } from '@/lib/auth-client';
import { RolesConfig } from '@auxilium/configs/roles';
import {
  Boxes,
  ChartArea,
  Edit2,
  FileText,
  Settings,
  TableOfContents,
  Target,
} from 'lucide-react';
import { useCallback } from 'react';
import { useParams } from 'react-router';

export default function SingleEventDetailsPage() {
  const { eventId } = useParams();
  const { data, isLoading } = useGetEventByIdQuery({ eventId: eventId ?? '' });
  const { data: authData } = authClient.useSession();

  if (isLoading) {
    // TODO: Add skeleton loading state here
    return <LoadingComponent />;
  }

  if (!data?.data) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        {/* TODO: Add Sede empty state */}
        <h1 className='text-4xl font-bold'>Where is my event???</h1>
      </div>
    );
  }

  // Check if user can assign user event roles
  {
    /* TODO: Should find a more efficient way to not show for non COORDINATOR / SUPERADMIN */
  }
  const canAssign =
    data?.data.userEventRoles.find(
      (r) => r.user.userProfile.userId === authData?.session.id,
      // @ts-expect-error - role is a custom attribute
    ) || authData?.user.role?.roleId === RolesConfig.SUPERADMIN;

  return (
    <div className='flex h-full w-full flex-col gap-4'>
      <BackButton />
      <div className='flex flex-row items-start justify-between'>
        <div>
          <h1 className='text-3xl font-semibold'>{data?.data.name}</h1>
          <p className='text-muted-foreground'>{data?.data.description}</p>
        </div>
        <div className='flex flex-row items-center gap-2'>
          <div className='flex flex-row items-center gap-0.5'>
            {canAssign && <AssignUserDialog event={data.data} />}
            <EditEventModal eventId={data.data.eventId} />
          </div>
          <GenerateEventReportButton event={data?.data} />
        </div>
      </div>

      {/* TODO: Convert into reusable component */}
      <div className='flex h-full w-full flex-col'>
        <Tabs defaultValue={'overview'} className='flex h-full flex-col'>
          <div className='w-full border-b bg-transparent'>
            <TabsList className='inline-flex flex-row justify-start gap-2 rounded-none border-0 bg-transparent p-0'>
              <TabsTrigger
                value={'overview'}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
              >
                <TableOfContents /> Overview
              </TabsTrigger>
              <TabsTrigger
                value={'progress'}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
              >
                <Target /> Progress
              </TabsTrigger>
              <TabsTrigger
                value={'reports'}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
              >
                <FileText /> Report
              </TabsTrigger>
              <TabsTrigger
                value={'resources'}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
              >
                <Boxes /> Resources
              </TabsTrigger>
              <TabsTrigger
                value={'analytics'}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
              >
                <ChartArea /> Analytics
              </TabsTrigger>
              <TabsTrigger
                value={'settings'}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent bg-transparent! px-3 hover:px-4 data-[state=active]:shadow-none!'
              >
                <Settings /> Settings
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Overview */}
          <TabsContent
            value={'overview'}
            className='flex w-full flex-row justify-center gap-16 p-3'
          >
            <div className='flex h-full w-full flex-col gap-2 md:w-1/2 2xl:w-1/3'>
              {/* <h1 className='text-xl font-medium'>Event Details</h1> */}
              <EventDetailsCard
                event={data?.data}
                className='w-full text-nowrap'
              />
              {/* Helpers List */}
              <EventTeamList className='w-full' />
            </div>

            <div className='flex h-full w-full flex-col gap-2'>
              <h1 className='mb-2 text-xl font-medium'>Tasks</h1>
              <EventTaskList eventId={data.data.eventId} />
            </div>
          </TabsContent>

          {/* Progress */}
          <TabsContent
            value={'progress'}
            className='flex flex-row items-center justify-center gap-3 p-3'
          >
            <div className='border-muted-foreground flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed p-2'>
              {/* TODO: Swap between kanban and list */}
              Task list goes here
            </div>
            <div className='border-muted-foreground flex h-full w-1/4 flex-col items-center justify-center rounded-xl border border-dashed'>
              Filters should go here
            </div>
          </TabsContent>

          {/* Reports */}
          <TabsContent value={'reports'}>
            <div className='flex h-full w-full flex-col py-2'>
              <EventReportDataTable event={data.data} />
            </div>
          </TabsContent>

          <TabsContent
            value={'resources'}
            className='flex flex-col items-center justify-center'
          >
            <ComingSoonEmpty />
          </TabsContent>

          <TabsContent
            value={'analytics'}
            className='flex flex-col items-center justify-center'
          >
            <ComingSoonEmpty />
          </TabsContent>

          <TabsContent
            value={'settings'}
            className='flex flex-col p-3 items-center'
          >
            <EventSettings eventId={data.data.eventId}/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
