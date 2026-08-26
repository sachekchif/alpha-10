'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/auth/components/AuthLayout';

export default function ResetSuccessPage() {
  return (
    <AuthLayout>
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
          className="relative inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6 text-emerald-400"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <h1 className="text-3xl font-medium text-white mb-3 tracking-tight">Password Reset Complete</h1>
        <p className="text-sm text-gray-300 leading-relaxed mb-8 max-w-sm mx-auto">
          Your account credentials have been updated securely. You can now log in using your new password.
        </p>

        <div className="p-4 bg-[#141417] border border-emerald-500/20 rounded-xl mb-8 flex items-center gap-3 text-xs text-emerald-200 text-left">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>All active administrative sessions on other devices have been invalidated.</span>
        </div>

        <Link
          href="/auth/login"
          className="w-full py-[0.9rem] bg-[#961A1C] hover:bg-[#961A1C]/85 text-white border-none rounded-md text-base font-semibold no-underline flex justify-center items-center gap-2 transition-all shadow-lg shadow-[#961A1C]/20"
        >
          <span>Go to Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </AuthLayout>
  );
}
