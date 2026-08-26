'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/auth/components/AuthLayout';
import { useToast } from '@/auth/components/ToastContainer';

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const email = searchParams.get('email') || 'your registered email';

  const [isResending, setIsResending] = useState(false);

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      toast.success(`Reset link re-sent to ${email}`, 'Email Sent');
    }, 1200);
  };

  return (
    <div className="text-center py-4">
      <div className="relative inline-flex items-center justify-center w-20 h-20 bg-[#961A1C]/10 border border-[#961A1C]/30 rounded-full mb-6">
        <Mail className="w-10 h-10 text-[#961A1C]" />
        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-[#08080a]">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      </div>

      <h1 className="text-3xl font-medium text-white mb-2 tracking-tight">Check your email</h1>
      <p className="text-sm text-gray-300 leading-relaxed mb-6">
        We&apos;ve sent a password reset link to <br />
        <span className="font-semibold text-white">{email}</span>
      </p>

      <div className="p-4 bg-[#141417] border border-gray-800/80 rounded-xl mb-8 text-left text-xs text-gray-400 space-y-2">
        <p className="font-medium text-gray-300">Didn&apos;t receive the email?</p>
        <ul className="list-disc list-inside space-y-1 text-gray-400">
          <li>Check your spam or junk folder</li>
          <li>Verify you entered the correct email address</li>
          <li>Wait a few minutes and try resending</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleResend}
          disabled={isResending}
          className="w-full py-[0.85rem] bg-[#141417] hover:bg-gray-800 text-white border border-gray-800 rounded-md text-sm font-semibold cursor-pointer transition-colors duration-200 flex justify-center items-center gap-2"
        >
          {isResending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Resending Email...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 text-gray-400" />
              <span>Resend Email</span>
            </>
          )}
        </button>

        <Link
          href="/auth/login"
          className="w-full py-[0.85rem] bg-[#961A1C] hover:bg-[#961A1C]/85 text-white border-none rounded-md text-sm font-semibold no-underline flex justify-center items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-900 text-xs text-gray-500">
        <p className="mb-2">Testing password reset flow?</p>
        <Link
          href="/auth/reset-password?token=alpha10_secure_demo_token_2026"
          className="inline-flex items-center gap-1.5 text-[#961A1C] font-medium hover:underline"
        >
          <span>Proceed to Reset Password Page</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-white text-sm py-10 text-center">Loading...</div>}>
        <CheckEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
