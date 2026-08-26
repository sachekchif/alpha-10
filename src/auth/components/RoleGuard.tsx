'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/auth/hooks/useReduxHooks';
import { isSuperAdmin, isControl } from '@/auth/types/auth.types';

interface RoleGuardProps {
  children: React.ReactNode;
  /**
   * Pass role keys that are allowed. Accepts:
   *   'SuperAdmin' — grants access to SuperAdmin users (any variant)
   *   'Control'    — grants access to Control users (any variant)
   *   'All'        — grants access to any authenticated user
   */
  allowedRoles: Array<'SuperAdmin' | 'Control' | 'All'>;
  /** Optional redirect destination for unauthorized access (defaults to '/403') */
  unauthorizedRedirect?: string;
}

/**
 * RoleGuard — wraps a page/layout to enforce role-based access control.
 *
 * Behaviour:
 *  1. If unauthenticated  → redirect to /auth/login?expired=true
 *  2. If wrong role       → redirect to /403 (or custom unauthorizedRedirect)
 *  3. If allowed          → render children
 *
 * Rendered as a client component so it can read from the Redux store.
 * The redirect happens before paint, so there is no flash of restricted content.
 */
export function RoleGuard({
  children,
  allowedRoles,
  unauthorizedRedirect = '/403',
}: RoleGuardProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.token);

  const role = user?.role;

  const isAllowed = React.useMemo(() => {
    if (!isAuthenticated || !token) return false;
    if (allowedRoles.includes('All')) return true;

    const userIsSuperAdmin = isSuperAdmin(role);
    const userIsControl = isControl(role);

    if (allowedRoles.includes('SuperAdmin') && userIsSuperAdmin) return true;
    if (allowedRoles.includes('Control') && userIsControl) return true;

    return false;
  }, [isAuthenticated, token, role, allowedRoles]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isAuthenticated || !token) {
      router.replace('/auth/login?expired=true');
      return;
    }

    if (!isAllowed) {
      router.replace(unauthorizedRedirect);
    }
  }, [isAuthenticated, token, isAllowed, router, unauthorizedRedirect]);

  // While redirecting, render nothing to avoid flash
  if (!isAuthenticated || !token || !isAllowed) {
    return null;
  }

  return <>{children}</>;
}
