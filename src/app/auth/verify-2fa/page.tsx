'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCw, Clock, Mail, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/auth/components/AuthLayout';
import { OTPInput } from '@/auth/components/OTPInput';
import { useVerify2FAMutation, useLoginMutation } from '@/auth/services/authApi';
import { useAppDispatch, useAppSelector } from '@/auth/hooks/useReduxHooks';
import { setCredentials } from '@/auth/store/authSlice';
import { useToast } from '@/auth/components/ToastContainer';
import { AuthUser } from '@/auth/types/auth.types';

function Verify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const pendingEmail = useAppSelector((state) => state.auth.pendingEmail);
  const pendingCredentials = useAppSelector((state) => state.auth.pendingCredentials);

  const emailParam = searchParams.get('email') || pendingEmail || 'admin@alpha10.com';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [shake, setShake] = useState(false);

  const [verify2FA, { isLoading: isVerifying }] = useVerify2FAMutation();
  const [login] = useLoginMutation();

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const format2FAError = (rawMessage?: string): string => {
    if (!rawMessage) return 'Invalid or expired OTP';
    const lower = rawMessage.toLowerCase();
    if (lower.includes('bvn') || lower.includes('invalid bvn') || lower.includes('invalid email or password')) {
      return 'Invalid or expired OTP';
    }
    return rawMessage;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setError('');

    if (!pendingCredentials?.email || !pendingCredentials?.password) {
      const msg = 'Login session credentials unavailable. Please return to the login page.';
      setError(msg);
      toast.error(msg, 'Resend Failed');
      triggerShake();
      return;
    }

    setIsResending(true);
    try {
      const result = await login({
        email: pendingCredentials.email,
        password: pendingCredentials.password,
      }).unwrap();

      if (result.statusCode !== undefined && result.statusCode !== 0 && result.statusCode !== 200) {
        const msg = format2FAError(result.statusMessage || 'Failed to resend verification code.');
        setError(msg);
        toast.error(msg, 'Resend Failed');
        triggerShake();
        setIsResending(false);
        return;
      }

      setCode('');
      setTimer(30);
      setCanResend(false);
      const notifyMsg = result.statusMessage || `A new verification code has been sent to ${emailParam}.`;
      toast.success(notifyMsg, 'Code Resent');
    } catch (err: any) {
      const errorMessage = format2FAError(
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.statusMessage ||
        (typeof err?.error === 'string' && err.error.includes('Failed to fetch')
          ? 'Unable to connect to authentication server.'
          : err?.error || 'Failed to resend verification code.')
      );

      setError(errorMessage);
      toast.error(errorMessage, 'Resend Failed');
      triggerShake();
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const targetCode = codeToVerify || code;
    setError('');

    if (targetCode.length !== 6) {
      const msg = 'Please enter the full 6-digit verification code';
      setError(msg);
      triggerShake();
      return;
    }

    try {
      const result = await verify2FA({ email: emailParam, code: targetCode }).unwrap();

      if (result.statusCode !== undefined && result.statusCode !== 0 && result.statusCode !== 200) {
        const msg = format2FAError(result.statusMessage || 'Invalid or expired OTP');
        setError(msg);
        toast.error(msg, 'Verification Failed');
        triggerShake();
        return;
      }

      // Extract JWT and user details from backend response data or token property
      const resData = result.data as {
        token?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        user?: AuthUser;
      } | undefined;
      const resObj = result as { token?: string; user?: AuthUser };

      let token = '';
      if (typeof result.data === 'string' && result.data.length > 10) {
        token = result.data;
      } else if (resData?.token) {
        token = resData.token;
      } else if (resObj.token) {
        token = resObj.token;
      } else {
        token = 'alpha10_authenticated_jwt_session';
      }

      const displayName = resData?.firstName
        ? `${resData.firstName} ${resData.lastName || ''}`.trim()
        : emailParam.split('@')[0].toUpperCase();

      const user: AuthUser = resObj.user || resData?.user || {
        id: 'adm_101',
        name: displayName,
        email: resData?.email || emailParam,
        role: 'SUPER_ADMIN',
      };

      dispatch(setCredentials({ user, token, rememberMe: true }));
      const successMsg = result.statusMessage || 'Two-factor authentication successful. Access granted.';
      toast.success(successMsg, '2FA Verified');

      // Role-based redirect: SuperAdmin → dashboard overview, Control → Retail CMS
      const { isSuperAdmin: checkSuperAdmin, isControl: checkControl } = await import('@/auth/types/auth.types');
      if (checkControl(user.role)) {
        router.push('/dashboard/retail/education');
      } else {
        // SuperAdmin, Audit, Operations, Approver, Initiator → full dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      const rawMsg =
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.statusMessage ||
        (typeof err?.error === 'string' && err.error.includes('Failed to fetch')
          ? 'Unable to connect to authentication server. Please try again.'
          : 'Invalid or expired OTP');
      const msg = format2FAError(rawMsg);
      setError(msg);
      toast.error(msg, 'Verification Failed');
      triggerShake();
    }
  };

  return (
    <>
      {/* 2FA White Badge with black text */}
      <div className="flex items-center gap-3 mb-4">
        <div className="px-3 py-1.5 bg-white text-black font-bold text-md rounded-md shadow-sm tracking-wider select-none">
          2-FA
        </div>
      </div>

      {/* <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Two-Factor Security</h1> */}
      <p className="text-sm text-white leading-relaxed mb-4">
        A 6-digit pin was sent to your email, use it to authorize your account.
      </p>

      {/* Back button with white text saying Change email */}
      <div className="mb-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-gray-300 transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span>Change email</span>
        </Link>
      </div>

      {/* Target Email Box: Your Inbox with Mail icon on left, and email under both */}
      <div className="p-3 mb-5 bg-[#24242a] border border-gray-700/80 rounded-lg space-y-1">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs font-medium text-gray-300">Your Inbox</span>
        </div>
        <div className="text-sm font-semibold text-white truncate">{emailParam}</div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-[#961A1C]/50 rounded-lg text-xs text-white font-medium leading-relaxed">
          {error}
        </div>
      )}

      <motion.form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify();
        }}
        animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <OTPInput
          value={code}
          onChange={(newCode) => {
            setCode(newCode);
            if (error) setError('');
          }}
          onComplete={(completedCode) => {
            handleVerify(completedCode);
          }}
          disabled={isVerifying || isResending}
          hasError={!!error}
        />

        <div className="flex items-center justify-between my-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>Code expires in:</span>
            <span className="font-mono font-semibold text-white">
              00:{timer < 10 ? `0${timer}` : timer}
            </span>
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isResending || isVerifying}
            className={`inline-flex items-center gap-1.5 font-medium transition-colors ${canResend && !isResending && !isVerifying
              ? 'text-[#961A1C] hover:text-red-400 cursor-pointer'
              : 'text-gray-600 cursor-not-allowed'
              }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : canResend ? 'hover:rotate-180 transition-transform' : ''}`} />
            <span>
              {isResending
                ? 'Sending code...'
                : canResend
                  ? 'Resend code'
                  : `Resend code in ${timer}s`}
            </span>
          </button>
        </div>

        <button
          type="submit"
          disabled={isVerifying || isResending || code.length !== 6}
          className="w-full py-[0.9rem] bg-[#961A1C] text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-[#961A1C]/85 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-[#961A1C]/20"
        >
          {isVerifying ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Verifying...</span>
            </>
          ) : (
            'Verify Security Code'
          )}
        </button>
      </motion.form>
    </>
  );
}

export default function Verify2FAPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-white text-sm py-10 text-center">Loading...</div>}>
        <Verify2FAContent />
      </Suspense>
    </AuthLayout>
  );
}
