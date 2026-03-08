import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import type { Event, EventReport } from '../events.dto';
import {
  eventsApiSlice,
  useGetEventByIdQuery,
  useGetEventReportByIdQuery,
  useGetParticipationsByReportIdQuery,
} from '../state/events-api-slice';
import {
  nextPage,
  prevPage,
  selectEventReportPaginationState,
  setEventReportId,
  setPage,
  setPageSize,
} from '../state/event-report-pagination-slice';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FileWarning } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './participation-table-columns';
import {
  PaginationControls,
  type PaginationControlDef,
} from '@/components/misc/pagination-controls';
import { Input } from '@/components/ui/input';

function EventReportItem({ report }: { report: EventReport }) {
  const paginationState = useAppSelector(selectEventReportPaginationState);
  const dispatch = useAppDispatch();

  const isActive = paginationState.eventReportId === report.eventReportId;

  const handleClick = () => {
    dispatch(setEventReportId(report.eventReportId));
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'bg-card cursor-pointer rounded-md px-3 py-2',
        isActive && 'bg-muted border',
      )}
    >
      <h1 className='truncate text-ellipsis'>Report {report.eventReportId}</h1>
      <div className='flex flex-row gap-2'>
        <p className='text-xs'>Signups: {report.signupCount}</p>
        <p className='text-xs'>Feedback: {report.feedbackCount}</p>
      </div>
      <p className='text-muted-foreground text-xs'>
        {format(report.createdAt, 'do MMM yyyy hh:mm a')}
      </p>
    </div>
  );
}

export function EventReportsList({ eventId }: { eventId: string }) {
  const { data } = useGetEventByIdQuery({ eventId });

  if (!data?.data) return <div>Event data not found.</div>;

  return (
    <div className='scrollbar-none hover:scrollbar-thin hover:pe-1.5 ease-in duration-150 transition-all flex h-full max-h-full flex-col gap-2 overflow-y-scroll'>
      {data.data.eventReports.length === 0 && (
        <div className='text-muted-foreground flex h-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-5 text-center'>
          <FileWarning className='size-5' />
          <h1 className='font-medium'>No event reports found.</h1>
          <p className='text-xs'>
            Please generate a report first to view participation data.
          </p>
          <div className='mt-8 flex w-full flex-col gap-2'>
            {Array.from({ length: 3 }).map((v, i) => (
              <Skeleton className='h-12 w-full' key={i} />
            ))}
          </div>
        </div>
      )}
      {data?.data.eventReports.length > 0 &&
        data.data.eventReports.map((report) => (
          <EventReportItem report={report} />
        ))}
    </div>
  );
}

export function EventReportDataTable({ event }: { event: Event }) {
  const dispatch = useAppDispatch();
  const paginationState = useAppSelector(selectEventReportPaginationState);
  // const { data, isLoading } = useGetEventReportByIdQuery({
  //   eventReportId:
  //     paginationState.eventReportId ??
  //     '',
  // });
  const { data, isLoading } = useGetParticipationsByReportIdQuery({
    eventReportId: paginationState.eventReportId ?? '',
    ...paginationState
  });

  const paginationControls: PaginationControlDef = {
    state: paginationState,
    pageCount: data?.data.pageCount ?? 0,
    handleNext: nextPage,
    handlePrevious: prevPage,
    handleShowPage: setPage,
    handlePageSizeChange: setPageSize,
  };

  return (
    <div className='flex h-full flex-row gap-4'>
      <div className='flex w-1/5 flex-row'>
        <EventReportsList eventId={event.eventId} />
      </div>
      {/* TODO: Will tidy up again */}
      <div className='flex w-full flex-col gap-2'>
        {isLoading && <div>Loading...</div>}
        {!isLoading && !data?.data && (
          <div className='flex h-full w-full items-center justify-center'>
            <h1 className='text-muted-foreground rounded-md border border-dashed p-6 font-medium'>
              Select a report to view it's data.
            </h1>
          </div>
        )}
        {!isLoading && data?.data && (
          <div className='flex flex-col h-full gap-4'>
            {/* TODO: Placeholder search input */}
            <Input 
              type='text'
              placeholder='Search...'
              className='w-fit'
            />
            <div className='overflow-y-scroll max-h-full scrollbar-none hover:scrollbar-thin'>
              <DataTable columns={columns} data={data.data.participations} />
            </div>
            <PaginationControls
              paginationControls={paginationControls}
              updateCb={() =>
                dispatch(eventsApiSlice.util.invalidateTags(['EventReports']))
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
