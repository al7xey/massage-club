import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  activeSection: string;
}

const initialState: AdminState = {
  activeSection: 'dashboard',
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setActiveSection(state, action: PayloadAction<string>) {
      state.activeSection = action.payload;
    },
  },
});

export const { setActiveSection } = adminSlice.actions;
export const adminReducer = adminSlice.reducer;
