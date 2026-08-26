'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, LogIn, Lock } from 'lucide-react';
import { AuthLayout } from '@/auth/components/AuthLayout';
import { useAppDispatch } from '@/auth/hooks/useReduxHooks';
import { clearAuth } from '@/auth/store/authSlice';

export default function SessionExpiredPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Clear any residual stale tokens
    dispatch(clearAuth());
  }, [dispatch]);

  const handleLoginAgain = () => {
    router.push('/auth/login?expired=true');
  };

  return (
    <AuthLayout>
      <div className="text-center py-6">
        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6 text-amber-400">
          <Clock className="w-10 h-10" />
          <div className="absolute -bottom-1 -right-1 bg-[#961A1C] rounded-full p-1 border-2 border-[#08080a] text-white">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        <span className="block text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">
          Security Timeout
        </span>
        <h1 className="text-3xl font-medium text-white mb-3 tracking-tight">Session Expired</h1>
        <p className="text-sm text-gray-300 leading-relaxed mb-8 max-w-sm mx-auto">
          Your administrative session has timed out due to inactivity or token invalidation. Please authenticate again to continue.
        </p>

        <div className="p-4 bg-[#141417] border border-gray-800 rounded-xl mb-8 text-xs text-gray-400 text-left space-y-1.5">
          <div className="flex items-center justify-between text-gray-300 font-medium">
            <span>Session Status:</span>
            <span className="text-amber-400 font-semibold">Terminated (Idle)</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-normal">
            For banking security, inactive sessions are automatically locked to safeguard sensitive financial operations.
          </p>
        </div>

        <button
          onClick={handleLoginAgain}
          className="w-full py-[0.9rem] bg-[#961A1C] hover:bg-[#961A1C]/85 text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all shadow-lg shadow-[#961A1C]/20 flex justify-center items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Login Again</span>
        </button>
      </div>
    </AuthLayout>
  );
}
