import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthUser } from '../types/auth.types';

const getInitialToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('alpha10_token') || sessionStorage.getItem('alpha10_token') || null;
};

const getInitialUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem('alpha10_user') || sessionStorage.getItem('alpha10_user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
  return null;
};

const getSavedEmail = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('alpha10_saved_email') || null;
};

const initialToken = getInitialToken();
const initialUser = getInitialUser();

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  requires2FA: false,
  pendingEmail: getSavedEmail(),
  pendingCredentials: null,
  rememberMe: typeof window !== 'undefined' ? localStorage.getItem('alpha10_remember') === 'true' : false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string; rememberMe?: boolean }>
    ) => {
      const { user, token, rememberMe } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.requires2FA = false;
      state.pendingEmail = null;
      state.pendingCredentials = null;

      if (rememberMe) {
        state.rememberMe = true;
        localStorage.setItem('alpha10_token', token);
        localStorage.setItem('alpha10_user', JSON.stringify(user));
        localStorage.setItem('alpha10_remember', 'true');
        if (user.email) localStorage.setItem('alpha10_saved_email', user.email);
      } else {
        state.rememberMe = false;
        sessionStorage.setItem('alpha10_token', token);
        sessionStorage.setItem('alpha10_user', JSON.stringify(user));
        localStorage.removeItem('alpha10_remember');
      }
    },

    setPending2FA: (state, action: PayloadAction<{ email: string; password?: string }>) => {
      state.requires2FA = true;
      state.pendingEmail = action.payload.email;
      if (action.payload.password) {
        state.pendingCredentials = {
          email: action.payload.email,
          password: action.payload.password,
        };
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('alpha10_2fa_email', action.payload.email);
      }
    },

    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },

    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.requires2FA = false;
      state.pendingEmail = null;
      state.pendingCredentials = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('alpha10_token');
        localStorage.removeItem('alpha10_user');
        sessionStorage.removeItem('alpha10_token');
        sessionStorage.removeItem('alpha10_user');
        sessionStorage.removeItem('alpha10_2fa_email');
      }
    },
  },
});

export const { setCredentials, setPending2FA, setRememberMe, clearAuth } = authSlice.actions;
export default authSlice.reducer;
