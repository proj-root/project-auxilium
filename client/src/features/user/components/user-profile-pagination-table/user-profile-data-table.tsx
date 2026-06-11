import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import {
  nextPage,
  prevPage,
  selectUserProfilePaginationState,
  setPage,
  setPageSize,
  setSearch,
} from './user-profile-pagination-slice';
import {
  useGetAllUserProfilesQuery,
  userApiSlice,
} from '../../state/user-api-slice';
import {
  PaginationControls,
  type PaginationControlDef,
} from '@/components/misc/pagination-controls';
import { SearchFilter } from '@/components/search-filter';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

export function UserProfileDataTable() {
  const dispatch = useAppDispatch();
  const paginationState = useAppSelector(selectUserProfilePaginationState);

  const { data, isLoading, isError } = useGetAllUserProfilesQuery({
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
        <div className='flex h-full w-full items-center justify-center'>
          <h1 className='text-muted-foreground rounded-md border border-dashed p-6 font-medium'>
            Something went wrong while fetching users. Please try again.
          </h1>
        </div>
      )}

      {!isLoading && data?.data && (
        <div className='flex h-full flex-col gap-4'>
          <SearchFilter setSearchCb={setSearch} />
          <DataTable columns={columns} data={data.data.userProfiles} />
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
                dispatch(
                  userApiSlice.util.invalidateTags(['User-Profile-Pagination']),
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
