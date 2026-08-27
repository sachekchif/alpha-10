import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { authApi } from '../services/authApi';
import { adminApi } from '../services/adminApi';
import { retailApi } from '../services/retailApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [retailApi.reducerPath]: retailApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(adminApi.middleware)
      .concat(retailApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
