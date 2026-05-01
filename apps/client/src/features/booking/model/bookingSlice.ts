import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingDraft {
  serviceId?: string;
  studioId?: string;
  masterId?: string;
  startsAt?: string;
}

interface BookingState {
  draft: BookingDraft;
}

const initialState: BookingState = {
  draft: {},
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    updateBookingDraft(state, action: PayloadAction<BookingDraft>) {
      state.draft = { ...state.draft, ...action.payload };
    },
    resetBookingDraft(state) {
      state.draft = {};
    },
  },
});

export const { updateBookingDraft, resetBookingDraft } = bookingSlice.actions;
export const bookingReducer = bookingSlice.reducer;
