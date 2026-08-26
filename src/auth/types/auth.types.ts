export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  statusMessage: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  statusCode?: number;
  statusMessage?: string;
  data?: unknown;
  token?: string;
  requires2FA?: boolean;
  email?: string;
  user?: AuthUser;
  message?: string;
}

export interface Verify2FARequest {
  email: string;
  code: string;
}

export interface Verify2FAResponse {
  statusCode?: number;
  statusMessage?: string;
  data?: unknown;
  token?: string;
  user?: AuthUser;
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  statusCode?: number;
  statusMessage?: string;
  data?: unknown;
  success?: boolean;
  message?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  email: string;
}

export interface ResetPasswordResponse {
  statusCode?: number;
  statusMessage?: string;
  data?: unknown;
  success?: boolean;
  message?: string;
}

export interface LogoutResponse {
  statusCode?: number;
  statusMessage?: string;
  data?: unknown;
  success?: boolean;
  message?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  requires2FA: boolean;
  pendingEmail: string | null;
  pendingCredentials: { email: string; password: string } | null;
  rememberMe: boolean;
}

// ─── Role helpers ────────────────────────────────────────────────────────────
// Normalizes role strings from both hardcoded values and live backend responses.
export function isSuperAdmin(role?: string): boolean {
  if (!role) return false;
  return ['SuperAdmin', 'SUPER_ADMIN', 'superadmin', 'super_admin'].includes(role);
}

export function isControl(role?: string): boolean {
  if (!role) return false;
  return ['Control', 'control'].includes(role);
}

export function getRoleLabel(role?: string): string {
  if (isSuperAdmin(role)) return 'Super Admin';
  if (isControl(role)) return 'Control';
  return role || 'Admin';
}
