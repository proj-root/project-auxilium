import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import type { EventReport } from '../events.dto';
import {
  useGetEventByIdQuery,
  useGetEventReportByIdQuery,
} from '../state/events-api-slice';
import {
  selectEventReportPaginationState,
  setEventReportId,
} from '../state/event-report-pagination-slice';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
    <div className='flex max-h-full flex-col gap-2 overflow-y-scroll'>
      {data?.data.eventReports.length > 0 &&
        data.data.eventReports.map((report) => (
          <EventReportItem report={report} />
        ))}
    </div>
  );
}

export function EventReportDataTable({ eventId }: { eventId: string }) {
  const paginationState = useAppSelector(selectEventReportPaginationState);
  const { data, isLoading } = useGetEventReportByIdQuery({
    eventReportId: paginationState.eventReportId ?? '',
  });

  return (
    <div className='flex max-h-full flex-row gap-4'>
      <div className='flex w-1/5 flex-row'>
        {/* <h1 className='text-2xl font-semibold'>Reports</h1> */}
        <EventReportsList eventId={eventId} />
      </div>
      {/* TODO: Will tidy up again */}
      <div className='flex w-full flex-col gap-2 h-[400px] overflow-y-scroll'>
        {isLoading && <div>Loading...</div>}
        {!isLoading &&
          data?.data &&
          data.data.eventParticipations.map((participation) => (
            <div>{participation.userProfile.ichat}</div>
          ))}
      </div>
    </div>
  );
}
