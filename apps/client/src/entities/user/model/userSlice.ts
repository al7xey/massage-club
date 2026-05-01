import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PublicUserDto } from '@massage/shared';

interface UserState {
  profile: PublicUserDto | null;
}

const initialState: UserState = {
  profile: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<PublicUserDto>) {
      state.profile = action.payload;
    },
    clearProfile(state) {
      state.profile = null;
    },
  },
});

export const { setProfile, clearProfile } = userSlice.actions;
export const userReducer = userSlice.reducer;
