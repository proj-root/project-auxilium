import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import type { Event, EventReport } from '../events.dto';
import {
  eventsApiSlice,
  useGetParticipationsByReportIdQuery,
} from '../state/events-api-slice';
import {
  nextPage,
  prevPage,
  selectEventReportPaginationState,
  setPage,
  setPageSize,
  setPointsType,
  setSearch,
} from '../state/event-report-pagination-slice';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './participation-table-columns';
import {
  PaginationControls,
  type PaginationControlDef,
} from '@/components/misc/pagination-controls';
import { Input } from '@/components/ui/input';
import { SearchFilter } from '@/components/search-filter';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

function PointsTypeFilter() {
  const dispatch = useAppDispatch();
  const paginationState = useAppSelector(selectEventReportPaginationState);

  // Set up key state to reset select component
  const [selectKey, setSelectKey] = useState(+new Date());

  const handleChange = (value: string | undefined) => {
    dispatch(setPointsType(value));
    setSelectKey(+new Date()); // Force radix to reset
  };

  return (
    <div className='flex items-center gap-2'>
      <Select key={selectKey} value={paginationState.pointsType} onValueChange={handleChange}>
        <SelectTrigger className='w-48'>
          <SelectValue placeholder='Filter by points type...' />
        </SelectTrigger>
        <SelectContent position='popper'>
          <SelectGroup>
            <SelectItem value='LEADERSHIP'>Leadership</SelectItem>
            <SelectItem value='PARTICIPATION'>Participation</SelectItem>
            <SelectItem value='SERVICE'>Service</SelectItem>
            <SelectItem value='COMMUNITY SERVICE'>Community Service</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {paginationState.pointsType && (
        <Button variant={'ghost'} size={'icon-xs'} onClick={() => handleChange(undefined)}>
          <X />
        </Button>
      )}
    </div>
  );
}

export function EventReportDataTable({ event }: { event: Event }) {
  const dispatch = useAppDispatch();
  const paginationState = useAppSelector(selectEventReportPaginationState);

  const { data, isLoading } = useGetParticipationsByReportIdQuery({
    eventReportId: event.eventReport?.eventReportId ?? '',
    ...paginationState,
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
      <div className='flex w-full flex-col gap-2'>
        {isLoading && <div>Loading...</div>}
        {!isLoading && !data?.data && (
          <div className='flex h-full w-full items-center justify-center'>
            <h1 className='text-muted-foreground rounded-md border border-dashed p-6 font-medium'>
              Please generate a report first to view participation records.
            </h1>
          </div>
        )}
        {!isLoading && data?.data && (
          <div className='flex h-full flex-col gap-4'>
            {/* TODO: Placeholder search input */}
            <div className='flex items-center justify-between'>
              <div className='flex gap-4'>
                <SearchFilter placeholder='Search name or admin number...' className='min-w-100' setSearchCb={setSearch} />
                <PointsTypeFilter />
              </div>
              <p className='text-muted-foreground mr-2 font-mono text-sm antialiased'>
                Generated on{' '}
                {format(
                  event?.eventReport?.updatedAt as Date,
                  'do MMM yyyy hh:mm a',
                )}
              </p>
            </div>
            <DataTable columns={columns} data={data.data.participations} />
            <div className='flex flex-row justify-between px-2'>
              <p className='text-muted-foreground w-full font-mono text-sm antialiased'>
                Showing {paginationState.page} -{' '}
                {Math.min(
                  Number(paginationState.page) *
                    Number(paginationState.pageSize),
                  data.data.total,
                )}{' '}
                of {data.data.total} records
              </p>
              <PaginationControls
                paginationControls={paginationControls}
                updateCb={() =>
                  dispatch(eventsApiSlice.util.invalidateTags(['EventReports']))
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
