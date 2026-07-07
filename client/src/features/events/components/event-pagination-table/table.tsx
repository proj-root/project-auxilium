import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import {
  nextPage,
  prevPage,
  selectEventPaginationState,
  setPage,
  setPageSize,
  setSearch,
} from '../../state/event-pagination-slice';
import { eventsApiSlice, useGetAllEventsQuery } from '../../state/events-api-slice';
import { PaginationControls, type PaginationControlDef } from '@/components/misc/pagination-controls';
import { SearchFilter } from '@/components/search-filter';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { EventItemContextMenu } from '../event-context-menu';

export function EventDataTable() {
  const dispatch = useAppDispatch();
  const paginationState = useAppSelector(selectEventPaginationState);

  const { data, isLoading, isError } = useGetAllEventsQuery({
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
    <div className='flex h-full w-full flex-col gap-4'>
      {/* Loading state */}
      {isLoading && <div>Loading...</div>}

      {/* Error state */}
      {!isLoading && isError && (
        <div className='flex h-full flex-col w-full items-center justify-center'>
          <img src={'/not-found.png'} className='w-72 mb-6'/>
          <h1 className='text-2xl'>It&apos;s kinda empty in here...</h1>
          <p className='text-muted-foreground font-medium'>
            Something went wrong while fetching events. Please try again.
          </p>
        </div>
      )}

      {!isLoading && data?.data && (
        <div className='flex h-full flex-col gap-4'>
          <SearchFilter setSearchCb={setSearch} />
          <DataTable
            columns={columns}
            data={data.data.events}
            ContextMenu={EventItemContextMenu}
          />
          <div className='flex flex-row justify-between px-2'>
            <p className='text-muted-foreground w-full text-sm'>
              Showing {paginationState.page} -{' '}
              {Math.min(
                Number(paginationState.page) * Number(paginationState.pageSize),
                data.data.total,
              )}{' '}
              of {data.data.total} records
            </p>
            <PaginationControls
              paginationControls={paginationControls}
              updateCb={() =>
                dispatch(eventsApiSlice.util.invalidateTags(['Events']))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
