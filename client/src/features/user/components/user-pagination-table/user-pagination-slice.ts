import type { RootState } from '@/state/store';
import type { PaginationOptions } from '@auxilium/types/pagination';
import { createSlice } from '@reduxjs/toolkit';

export interface UserPaginationState extends PaginationOptions {
  roleId: string;
}

const initialState: UserPaginationState = {
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
  roleId: '',
};

const userPaginationSlice = createSlice({
  name: 'user-pagination',
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
    setRoleId: (state, action) => {
      state.roleId = action.payload;
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
  setRoleId
} = userPaginationSlice.actions;

export const selectUserPaginationState = (state: RootState) =>
  state.userPaginationSlice;

export default userPaginationSlice.reducer;