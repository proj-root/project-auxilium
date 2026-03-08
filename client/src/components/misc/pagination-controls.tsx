import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { cn } from '@/lib/utils';
import type { PaginationOptions } from '@auxilium/types/pagination';
import type { ActionCreatorWithoutPayload, ActionCreatorWithPayload } from '@reduxjs/toolkit';

export interface PaginationControlDef {
  state: PaginationOptions;
  pageCount: number;
  handlePrevious: ActionCreatorWithoutPayload;
  handleNext: ActionCreatorWithPayload<number>;
  handleShowPage: ActionCreatorWithPayload<number>;
  handlePageSizeChange: ActionCreatorWithPayload<number>;
}

export function PaginationControls({
  paginationControls,
  updateCb,
  className,
}: {
  paginationControls: PaginationControlDef;
  updateCb: () => void;
  className?: string;
}) {
  const dispatch = useAppDispatch();

  const getVisiblePages = () => {
    const { page } = paginationControls.state;
    const delta = 0;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= paginationControls.pageCount; i++) {
      if (
        // Accept first and last pages
        i === 1 ||
        i === paginationControls.pageCount ||
        page && (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      }
    }

    let last = 0;
    for (const i of range) {
      // Check if there is a gap between the previous and current buttons
      if (last && i - last > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      last = i;
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const handlePrevious = () => {
    dispatch(paginationControls.handlePrevious());
    // Update the data in the table
    updateCb();
  };

  const handleNext = () => {
    dispatch(paginationControls.handleNext(paginationControls.pageCount));
    // Update the data in the table
    updateCb();
    console.log('Clicked', paginationControls.state.page);
  };

  const handleShowPage = (page: number) => {
    dispatch(paginationControls.handleShowPage(page));
    updateCb();
  };

  const handlePageSizeChange = (pageSize: number) => {
    dispatch(paginationControls.handlePageSizeChange(pageSize));
    updateCb();
  };

  return (
    <Pagination className={cn('', className)}>
      <PaginationContent className='flex flex-row md:w-full md:justify-end'>
        <PaginationItem>
          <PaginationPrevious onClick={handlePrevious} data-testid={'pagination-previous'} />
        </PaginationItem>

        <div className='mx-2 flex flex-row gap-1'>
          {visiblePages.map((page, idx) =>
            page === '...' ? (
              <PaginationItem key={`dots-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handleShowPage(page as number)}
                  isActive={paginationControls.state.page === page}
                  className='cursor-pointer'
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
        </div>

        <PaginationItem>
          <Input
            id='pageSizeInput'
            type='number'
            placeholder='10'
            min={'1'}
            onChange={(e) => {
              const newPageSize = parseInt(e.target.value);
              if (!isNaN(newPageSize) && newPageSize > 0) {
                handlePageSizeChange(newPageSize);
              } else {
                handlePageSizeChange(10);
              }
            }}
            className='w-20'
            data-testid="pagination-page-size" // Added: For test assertion
          />
        </PaginationItem>

        <PaginationItem>
          <PaginationNext onClick={handleNext} data-testid={'pagination-next'} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}