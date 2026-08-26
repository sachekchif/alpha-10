'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '@/auth/components/AuthLayout';
import { AuthHeader } from '@/auth/components/AuthHeader';
import { PasswordStrength } from '@/auth/components/PasswordStrength';
import { useResetPasswordMutation } from '@/auth/services/authApi';
import { useToast } from '@/auth/components/ToastContainer';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const validate = () => {
    const errs: typeof errors = {};

    if (!email) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!token.trim()) {
      errs.token = 'Reset token or verification code is required';
    }

    if (!newPassword) {
      errs.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errs.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'New password and confirm password do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      const result = await resetPassword({ token: token.trim(), newPassword, email: email.trim() }).unwrap();

      if (result.statusCode !== undefined && result.statusCode !== 0 && result.statusCode !== 200) {
        const msg = result.statusMessage || 'Failed to reset password. Token may be invalid or expired.';
        setErrors({ general: msg });
        toast.error(msg, 'Reset Failed');
        return;
      }

      const notifyMsg = result.statusMessage || 'Password reset successfully.';
      toast.success(notifyMsg, 'Password Reset Success');
      router.push('/auth/reset-success');
    } catch (err: any) {
      const msg =
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.statusMessage ||
        (typeof err?.error === 'string' && err.error.includes('Failed to fetch')
          ? 'Unable to connect to authentication server. Please try again.'
          : 'Failed to reset password. The link or token may have expired.');

      setErrors({ general: msg });
      toast.error(msg, 'Reset Failed');
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-[#961A1C]/10 border border-[#961A1C]/30 rounded-xl text-[#961A1C]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
          Credential Security
        </span>
      </div>

      <AuthHeader
        title="Set New Password"
        subtitle="Create a strong, unique password for your administrator account."
        backUrl="/auth/login"
        backText="Cancel and Login"
      />

      {errors.general && (
        <div className="mb-6 p-3.5 bg-red-950/40 border border-[#961A1C]/50 rounded-lg flex items-center gap-3 text-white text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#961A1C]" />
          <span className="text-white font-medium">{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email input */}
        <div className="mb-4 relative">
          <label className="block text-[0.85rem] font-semibold text-white mb-2" htmlFor="email">
            Email Address
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-[0.8rem] bg-[#24242a] text-white border rounded-md text-base transition-colors duration-200 focus:outline-none placeholder-gray-400 ${
                errors.email
                  ? 'border-[#961A1C] focus:ring-2 focus:ring-[#961A1C]/40'
                  : 'border-gray-700/80 focus:border-[#961A1C] focus:ring-[3px] focus:ring-[#961A1C]/20'
              }`}
              placeholder="admin@alpha10.com"
              autoComplete="email"
            />
            <Mail className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          {errors.email && <span className="text-xs text-red-400 mt-1.5 block">{errors.email}</span>}
        </div>

        {/* Reset Token/OTP input */}
        <div className="mb-4 relative">
          <label className="block text-[0.85rem] font-semibold text-white mb-2" htmlFor="token">
            Reset Token / Security Code
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (errors.token) setErrors((prev) => ({ ...prev, token: undefined }));
              }}
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-[0.8rem] bg-[#24242a] text-white border rounded-md text-base transition-colors duration-200 focus:outline-none placeholder-gray-400 font-mono ${
                errors.token
                  ? 'border-[#961A1C] focus:ring-2 focus:ring-[#961A1C]/40'
                  : 'border-gray-700/80 focus:border-[#961A1C] focus:ring-[3px] focus:ring-[#961A1C]/20'
              }`}
              placeholder="Enter reset token or passcode"
            />
            <KeyRound className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          {errors.token && <span className="text-xs text-red-400 mt-1.5 block">{errors.token}</span>}
        </div>

        {/* New Password input */}
        <div className="mb-4 relative">
          <label className="block text-[0.85rem] font-semibold text-white mb-2" htmlFor="newPassword">
            New Password
          </label>
          <div className="relative flex items-center">
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              disabled={isLoading}
              className={`w-full pl-10 pr-11 py-[0.8rem] bg-[#24242a] text-white border rounded-md text-base transition-colors duration-200 focus:outline-none placeholder-gray-400 ${
                errors.newPassword
                  ? 'border-[#961A1C] focus:ring-2 focus:ring-[#961A1C]/40'
                  : 'border-gray-700/80 focus:border-[#961A1C] focus:ring-[3px] focus:ring-[#961A1C]/20'
              }`}
              placeholder="••••••••••••••••"
              autoComplete="new-password"
            />
            <Lock className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 p-1 text-gray-500 hover:text-white transition-colors"
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && <span className="text-xs text-red-400 mt-1.5 block">{errors.newPassword}</span>}

          <PasswordStrength password={newPassword} />
        </div>

        {/* Confirm Password input */}
        <div className="mb-8 relative">
          <label className="block text-[0.85rem] font-semibold text-white mb-2" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <div className="relative flex items-center">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              disabled={isLoading}
              className={`w-full pl-10 pr-11 py-[0.8rem] bg-[#24242a] text-white border rounded-md text-base transition-colors duration-200 focus:outline-none placeholder-gray-400 ${
                errors.confirmPassword
                  ? 'border-[#961A1C] focus:ring-2 focus:ring-[#961A1C]/40'
                  : 'border-gray-700/80 focus:border-[#961A1C] focus:ring-[3px] focus:ring-[#961A1C]/20'
              }`}
              placeholder="••••••••••••••••"
              autoComplete="new-password"
            />
            <Lock className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 p-1 text-gray-500 hover:text-white transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-red-400 mt-1.5 block">{errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-[0.9rem] bg-[#961A1C] text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-[#961A1C]/85 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-[#961A1C]/20"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Resetting Password...</span>
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-white text-sm py-10 text-center">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
