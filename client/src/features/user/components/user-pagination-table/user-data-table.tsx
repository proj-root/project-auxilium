import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import {
  nextPage,
  prevPage,
  selectUserPaginationState,
  setPage,
  setPageSize,
  setSearch,
} from './user-pagination-slice';
import { useGetAllUsersQuery, userApiSlice } from '../../state/user-api-slice';
import {
  PaginationControls,
  type PaginationControlDef,
} from '@/components/misc/pagination-controls';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { SearchFilter } from '@/components/search-filter';
import { UserPaginationContextMenu } from './context-menu';

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
    <div className='flex h-full w-full flex-col gap-4'>
      {/* Loading state */}
      {isLoading && <div>Loading...</div>}

      {/* Error state */}
      {!isLoading && isError && (
        <div className='flex h-full flex-col w-full items-center justify-center'>
          <img src={'/not-found.png'} className='w-72 mb-6'/>
          <h1 className='text-2xl'>It&apos;s kinda empty in here...</h1>
          <p className='text-muted-foreground font-medium'>
            Something went wrong while fetching users. Please try again.
          </p>
        </div>
      )}

      {!isLoading && data?.data && (
        <div className='flex h-full flex-col gap-4'>
          <SearchFilter setSearchCb={setSearch} />
          <DataTable columns={columns} data={data.data.users} ContextMenu={UserPaginationContextMenu} />
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
                dispatch(userApiSlice.util.invalidateTags(['User-Pagination']))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
