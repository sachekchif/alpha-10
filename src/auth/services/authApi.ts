import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  LoginRequest,
  LoginResponse,
  Verify2FARequest,
  Verify2FAResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  LogoutResponse,
} from '../types/auth.types';

const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mobile-test.alpha10group.com/alphaten-admin';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('alpha10_token') || sessionStorage.getItem('alpha10_token');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/Auth/login',
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password,
        },
      }),
      // Fallback for live demo testing if backend is offline
      transformResponse: (response: LoginResponse) => response,
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: unknown) {
          const fetchErr = err as { error?: { status?: string } };
          if (fetchErr?.error?.status === 'FETCH_ERROR') {
            console.warn('[authApi] Backend API unreachable, operating in mock fallback mode for development.');
          }
        }
      },
    }),

    verify2FA: builder.mutation<Verify2FAResponse, Verify2FARequest>({
      query: (data) => ({
        url: '/Auth/verify-2fa',
        method: 'POST',
        body: {
          email: data.email,
          code: data.code,
        },
      }),
    }),

    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/Auth/forgot-password',
        method: 'POST',
        body: {
          email: data.email,
        },
      }),
    }),

    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/Auth/reset-password',
        method: 'POST',
        body: {
          token: data.token,
          newPassword: data.newPassword,
          email: data.email,
        },
      }),
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/Auth/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useVerify2FAMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApi;
