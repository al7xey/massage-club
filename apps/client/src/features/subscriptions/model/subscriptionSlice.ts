import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SubscriptionState {
  selectedPlanId: string | null;
}

const initialState: SubscriptionState = {
  selectedPlanId: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    selectPlan(state, action: PayloadAction<string>) {
      state.selectedPlanId = action.payload;
    },
    clearSelectedPlan(state) {
      state.selectedPlanId = null;
    },
  },
});

export const { selectPlan, clearSelectedPlan } = subscriptionSlice.actions;
export const subscriptionReducer = subscriptionSlice.reducer;
