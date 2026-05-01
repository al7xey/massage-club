import { configureStore } from '@reduxjs/toolkit';
import { adminApi } from '@/shared/api/adminApi';
import { appointmentsApi } from '@/shared/api/appointmentsApi';
import { authApi } from '@/shared/api/authApi';
import { servicesApi } from '@/shared/api/servicesApi';
import { subscriptionsApi } from '@/shared/api/subscriptionsApi';
import { adminReducer } from '@/features/admin/model/adminSlice';
import { authReducer } from '@/features/auth/model/authSlice';
import { bookingReducer } from '@/features/booking/model/bookingSlice';
import { subscriptionReducer } from '@/features/subscriptions/model/subscriptionSlice';
import { userReducer } from '@/entities/user/model/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    booking: bookingReducer,
    subscription: subscriptionReducer,
    admin: adminReducer,
    [authApi.reducerPath]: authApi.reducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
    [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
    [appointmentsApi.reducerPath]: appointmentsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      servicesApi.middleware,
      subscriptionsApi.middleware,
      appointmentsApi.middleware,
      adminApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
