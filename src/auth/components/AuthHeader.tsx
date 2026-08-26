'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  backUrl?: string;
  backText?: string;
  badge?: string;
}

export function AuthHeader({ title, subtitle, backUrl, backText = 'Back', badge }: AuthHeaderProps) {
  return (
    <div className="mb-8">
      {backUrl && (
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>{backText}</span>
        </Link>
      )}

      {badge && (
        <span className="inline-block text-[11px] font-semibold text-[#961A1C] bg-[#961A1C]/10 border border-[#961A1C]/30 px-2.5 py-0.5 rounded-full mb-3">
          {badge}
        </span>
      )}

      <h1 className="text-3xl sm:text-5xl leading-tight font-noraml text-white mb-2 tracking-tight">
        {title}
      </h1>
      <p className="text-sm text-white leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}
