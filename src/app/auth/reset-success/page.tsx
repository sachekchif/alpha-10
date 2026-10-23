'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/auth/components/AuthLayout';
import { AuthHeader } from '@/auth/components/AuthHeader';

export default function ResetSuccessPage() {
  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-xl text-white shadow-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <AuthHeader
          title="Password Reset Complete"
          subtitle="Your account credentials have been updated securely. You can now log in using your new password."
        />

        <div className="p-3 mb-8 bg-[#24242a] border border-emerald-500/20 rounded-lg flex items-center gap-3 text-xs text-emerald-300 text-left">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="leading-relaxed">All active administrative sessions on other devices have been securely invalidated.</span>
        </div>

        <Link
          href="/auth/login"
          className="w-full py-[0.85rem] bg-[#961A1C] hover:bg-[#961A1C]/85 text-white border-none rounded-md text-sm font-semibold no-underline flex justify-center items-center gap-2 transition-all shadow-lg shadow-[#961A1C]/20"
        >
          <span>Go to Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </AuthLayout>
  );
}
