import type { RootState } from '@/state/store';
import type { PaginationOptions } from '@auxilium/types/pagination';
import { createSlice } from '@reduxjs/toolkit';

interface EventReportPaginationState extends PaginationOptions {
  eventReportId?: string;
}

const initialState: EventReportPaginationState = {
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
  eventReportId: undefined,
};

const eventReportPaginationSlice = createSlice({
  name: 'event-report-pagination',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    nextPage: (state, action) => {
      if (state.page && state.page < action.payload) {
        state.page += 1;
      }
    },
    prevPage: (state) => {
      if (state.page && state.page > 1) {
        state.page -= 1;
      }
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setEventReportId: (state, action) => {
      state.eventReportId = action.payload;
    },
  },
});

export const {
  setPage,
  nextPage,
  prevPage,
  setPageSize,
  setSortBy,
  setSortOrder,
  setSearch,
  setEventReportId,
} = eventReportPaginationSlice.actions;

export const selectEventReportPaginationState = (state: RootState) =>
  state.eventReportPaginationSlice;

export default eventReportPaginationSlice.reducer;
