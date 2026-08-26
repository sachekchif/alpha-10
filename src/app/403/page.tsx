'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { AuthLayout } from '@/auth/components/AuthLayout';
import { useAppDispatch } from '@/auth/hooks/useReduxHooks';
import { clearAuth } from '@/auth/store/authSlice';
import { useToast } from '@/auth/components/ToastContainer';

export default function UnauthorizedPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const handleLogout = () => {
    dispatch(clearAuth());
    toast.info('You have been logged out.', 'Signed Out');
    router.push('/auth/login');
  };

  return (
    <AuthLayout>
      <div className="text-center py-6">
        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-red-950/50 border border-[#961A1C]/50 rounded-full mb-6 text-[#961A1C]">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <span className="block text-xs font-semibold text-[#961A1C] uppercase tracking-widest mb-2">
          HTTP 403 Forbidden
        </span>
        <h1 className="text-3xl font-medium text-white mb-3 tracking-tight">Access Restricted</h1>
        <p className="text-sm text-gray-300 leading-relaxed mb-8 max-w-sm mx-auto">
          You do not have the required administrative permissions to view this resource. Contact your security supervisor if you believe this is an error.
        </p>

        <div className="p-4 bg-[#141417] border border-gray-800 rounded-xl mb-8 text-xs text-gray-400 text-left space-y-1">
          <div className="flex justify-between">
            <span>Security Zone:</span>
            <span className="text-gray-200 font-mono">CORE_BANKING_ADMIN</span>
          </div>
          <div className="flex justify-between">
            <span>Clearance Required:</span>
            <span className="text-red-400 font-semibold font-mono">LEVEL_3_RBAC</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full py-[0.85rem] bg-[#961A1C] hover:bg-[#961A1C]/85 text-white border-none rounded-md text-sm font-semibold no-underline flex justify-center items-center gap-2 transition-colors shadow-lg shadow-[#961A1C]/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full py-[0.85rem] bg-[#141417] hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 rounded-md text-sm font-semibold cursor-pointer transition-colors flex justify-center items-center gap-2"
          >
            <LogOut className="w-4 h-4 text-gray-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
