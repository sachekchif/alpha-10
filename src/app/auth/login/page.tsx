'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/auth/components/AuthLayout';
import { AuthHeader } from '@/auth/components/AuthHeader';
import { useLoginMutation } from '@/auth/services/authApi';
import { useAppDispatch } from '@/auth/hooks/useReduxHooks';
import { setPending2FA } from '@/auth/store/authSlice';
import { useToast } from '@/auth/components/ToastContainer';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [shake, setShake] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [login, { isLoading }] = useLoginMutation();

  const hasShownExpiredToast = React.useRef(false);

  useEffect(() => {
    if (searchParams.get('expired') === 'true' && !hasShownExpiredToast.current) {
      hasShownExpiredToast.current = true;
      toast.info('Your session expired. Please sign in again to continue.', 'Session Expired');
    }
  }, [searchParams, toast]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      triggerShake();
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      const result = await login({ email, password, rememberMe }).unwrap();

      if (result.statusCode !== undefined && result.statusCode !== 0 && result.statusCode !== 200) {
        const msg = result.statusMessage || 'Authentication failed. Please verify your credentials.';
        setErrors({ general: msg });
        toast.error(msg, 'Authentication Failed');
        triggerShake();
        return;
      }

      // Always dispatch pending 2FA with in-memory password for secure resend support
      dispatch(setPending2FA({ email, password }));
      const notifyMsg = result.statusMessage || 'Verification code sent to your registered email.';
      toast.info(notifyMsg, 'Verification Required');
      router.push(`/auth/verify-2fa?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const errorMessage =
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.statusMessage ||
        (typeof err?.error === 'string' && err.error.includes('Failed to fetch')
          ? 'Unable to connect to authentication server. Please check your internet connection.'
          : err?.error || 'Invalid email or password. Please try again.');

      setErrors({ general: errorMessage });
      toast.error(errorMessage, 'Authentication Failed');
      triggerShake();
    }
  };

  return (
    <>
      <AuthHeader
        title="Welcome Back"
        subtitle="Enter your administrative credentials to access the banking control center."
      />

      {errors.general && (
        <div className="mb-6 p-3.5 bg-red-950/40 border border-[#961A1C]/50 rounded-lg flex items-center gap-3 text-white text-xs leading-relaxed animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#961A1C]" />
          <span className="text-white font-medium">{errors.general}</span>
        </div>
      )}

      <motion.form
        onSubmit={handleLogin}
        noValidate
        animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="space-[#141417]"
      >
        <div className="mb-5 relative">
          <label className="block text-[0.85rem] text-white mb-2" htmlFor="email">
            Email Address
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-[0.8rem] bg-[#24242a] text-white border rounded-md text-base transition-colors duration-200 focus:outline-none placeholder-gray-400 ${errors.email
                ? 'border-[#961A1C] focus:ring-2 focus:ring-[#961A1C]/40'
                : 'border-gray-700/80 focus:border-[#961A1C] focus:ring-[3px] focus:ring-[#961A1C]/20'
                }`}
              placeholder="admin@alpha10.com"
              autoComplete="email"
            />
            <Mail className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          {errors.email && <span className="text-xs text-white font-medium mt-1.5 block">{errors.email}</span>}
        </div>

        <div className="mb-5 relative">
          <label className="block text-[0.85rem] text-white mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={`w-full pl-10 pr-11 py-[0.8rem] bg-[#24242a] text-white border rounded-md text-base transition-colors duration-200 focus:outline-none placeholder-gray-400 ${errors.password
                ? 'border-[#961A1C] focus:ring-2 focus:ring-[#961A1C]/40'
                : 'border-gray-700/80 focus:border-[#961A1C] focus:ring-[3px] focus:ring-[#961A1C]/20'
                }`}
              placeholder="••••••••••••••••"
              autoComplete="current-password"
            />
            <Lock className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 p-1 text-gray-500 hover:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <span className="text-xs text-white font-medium mt-1.5 block">{errors.password}</span>}
        </div>

        <div className="flex justify-between items-center mb-8 text-[0.85rem]">
          <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white select-none transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-[#961A1C]"
            />
            Keep me signed in
          </label>
          <Link
            href="/auth/forgot-password"
            className="font-semibold text-[#961A1C] hover:text-red-400 no-underline hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-[0.9rem] bg-[#961A1C] text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-[#961A1C]/85 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-[#961A1C]/20"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Authenticating...</span>
            </>
          ) : (
            'Login'
          )}
        </button>
      </motion.form>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-white text-sm py-10 text-center">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </AuthLayout>
  );
}
