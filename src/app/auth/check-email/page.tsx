'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/auth/components/AuthLayout';
import { AuthHeader } from '@/auth/components/AuthHeader';
import { useToast } from '@/auth/components/ToastContainer';
import { useForgotPasswordMutation } from '@/auth/services/authApi';

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const email = searchParams.get('email') || 'your registered email';

  const [isResending, setIsResending] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();

  const handleResend = async () => {
    setIsResending(true);
    try {
      await forgotPassword({ email }).unwrap();
      toast.success(`Reset link re-sent to ${email}`, 'Email Sent');
    } catch (err: any) {
      toast.error('Failed to resend email. Please try again.', 'Error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-b from-red-400 to-[#961A1C] rounded-xl text-white shadow-lg relative">
          <Mail className="w-6 h-6" />
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-[#08080a]">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      <AuthHeader
        title="Check your email"
        subtitle="We've sent a password reset link and code to your registered email address."
      />

      <div className="p-3 mb-4 bg-[#24242a] border border-gray-700/80 rounded-lg space-y-1">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs font-medium text-gray-300">Your Inbox</span>
        </div>
        <div className="text-sm font-semibold text-white truncate">{email}</div>
      </div>

      <p className="text-[0.8rem] text-gray-300 leading-relaxed mb-6">
        If there&apos;s no link or the link doesn&apos;t work, please copy the code from the email.
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
          href={`/auth/reset-password?email=${encodeURIComponent(email !== 'your registered email' ? email : '')}`}
          className="w-full py-[0.85rem] bg-[#961A1C] hover:bg-[#961A1C]/85 text-white border-none rounded-md text-sm font-semibold no-underline flex justify-center items-center gap-2 transition-colors shadow-lg shadow-[#961A1C]/20"
        >
          <span>Proceed to Reset Password</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-900 text-xs text-gray-500 flex justify-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-white font-medium hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </>
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
