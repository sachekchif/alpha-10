'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/auth/components/AuthLayout';
import { AuthHeader } from '@/auth/components/AuthHeader';
import { useForgotPasswordMutation } from '@/auth/services/authApi';
import { useToast } from '@/auth/components/ToastContainer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const toast = useToast();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const result = await forgotPassword({ email }).unwrap();

      if (result.statusCode !== undefined && result.statusCode !== 0 && result.statusCode !== 200) {
        const msg = result.statusMessage || 'Failed to request password reset. Please try again.';
        setError(msg);
        toast.error(msg, 'Request Failed');
        return;
      }

      const notifyMsg = result.statusMessage || 'Password reset instructions dispatched to your inbox.';
      toast.success(notifyMsg, 'Email Sent');
      router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const msg =
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.statusMessage ||
        (typeof err?.error === 'string' && err.error.includes('Failed to fetch')
          ? 'Unable to connect to authentication server. Please try again.'
          : 'Failed to request password reset. Please try again.');
      setError(msg);
      toast.error(msg, 'Request Error');
    }
  };

  return (
    <AuthLayout>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-[#961A1C]/10 border border-[#961A1C]/30 rounded-xl text-[#961A1C]">
          <KeyRound className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
          Account Recovery
        </span>
      </div>

      <AuthHeader
        title="Forgot Password?"
        subtitle="No worries. Enter your registered email and we'll send you a password reset link."
        backUrl="/auth/login"
        backText="Return to Login"
      />

      {error && (
        <div className="mb-6 p-3.5 bg-red-950/40 border border-[#961A1C]/50 rounded-lg flex items-center gap-3 text-white text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#961A1C]" />
          <span className="text-white font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-6 relative">
          <label className="block text-[0.85rem] font-semibold text-white mb-2" htmlFor="email">
            Registered Email Address
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-[0.8rem] bg-[#24242a] text-white border rounded-md text-base transition-colors duration-200 focus:outline-none placeholder-gray-400 ${
                error
                  ? 'border-[#961A1C] focus:ring-2 focus:ring-[#961A1C]/40'
                  : 'border-gray-700/80 focus:border-[#961A1C] focus:ring-[3px] focus:ring-[#961A1C]/20'
              }`}
              placeholder="admin@alpha10.com"
              autoComplete="email"
            />
            <Mail className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-[0.9rem] bg-[#961A1C] text-[#ffffff] border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-[#961A1C]/85 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-[#961A1C]/20"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending Reset Link...</span>
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
