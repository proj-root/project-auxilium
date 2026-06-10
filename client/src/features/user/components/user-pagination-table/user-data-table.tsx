import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import {
  nextPage,
  prevPage,
  selectUserPaginationState,
  setPage,
  setPageSize,
} from './user-pagination-slice';
import { useGetAllUsersQuery, userApiSlice } from '../../state/user-api-slice';
import { PaginationControls, type PaginationControlDef } from '@/components/misc/pagination-controls';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

export function UserDataTable() {
  const dispatch = useAppDispatch();
  const paginationState = useAppSelector(selectUserPaginationState);

  const { data, isLoading, isError } = useGetAllUsersQuery({
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
    <div className='flex flex-col w-full h-full gap-4'>
      {/* Loading state */}
      {isLoading && <div>Loading...</div>}

      {/* Error state */}
      {!isLoading && isError && (
        <div className='flex h-full w-full items-center justify-center'>
          <h1 className='text-muted-foreground rounded-md border border-dashed p-6 font-medium'>
            Something went wrong while fetching users. Please try again.
          </h1>
        </div>
      )}

      {!isLoading && data?.data && (
        <div className='flex h-full flex-col gap-4'>
          {/* TODO: Placeholder search input */}
          <Input type='text' placeholder='Search...' className='w-fit' />
          <div>
            <DataTable columns={columns} data={data.data.users} />
          </div>
          <PaginationControls
            paginationControls={paginationControls}
            updateCb={() =>
              dispatch(userApiSlice.util.invalidateTags(['User-Pagination']))
            }
          />
        </div>
      )}
    </div>
  );
}
