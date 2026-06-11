import type { RootState } from '@/state/store';
import type { PaginationOptions } from '@auxilium/types/pagination';
import { createSlice } from '@reduxjs/toolkit';

// export interface UserProfilePaginationState extends PaginationOptions {
  
// }

const initialState: PaginationOptions = {
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
};

const userProfilePaginationSlice = createSlice({
  name: 'user-profile-pagination',
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
} = userProfilePaginationSlice.actions;

export const selectUserProfilePaginationState = (state: RootState) =>
  state.userProfilePaginationSlice;

export default userProfilePaginationSlice.reducer;