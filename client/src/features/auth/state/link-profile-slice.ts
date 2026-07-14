import type { RootState } from "@/state/store";
import { createSlice } from "@reduxjs/toolkit";

export interface LinkProfileState {
  step: number;
  ichat?: string;
  profileExists: boolean;
}

const initialState: LinkProfileState = {
  step: 1,
  ichat: undefined,
  profileExists: false,
}

const linkProfileSlice = createSlice({
  name: "link-profile",
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.step = action.payload;
    },
    setProfileExists: (state, action) => {
      state.profileExists = action.payload;
    },
    setIChat: (state, action) => {
      state.ichat = action.payload;
    }
  }
});

export const { setStep, setProfileExists, setIChat } = linkProfileSlice.actions;
export const selectLinkProfileState = (state: RootState) => state.linkProfileSlice;

export default linkProfileSlice.reducer;