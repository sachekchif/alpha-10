'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen w-screen bg-[#08080a] font-sans antialiased text-white overflow-hidden">
      {/* Left Form Section (Scrollable, hidden scrollbar) */}
      <div className="flex flex-col justify-between items-center bg-[#08080a] px-6 sm:px-10 w-full md:w-[40%] h-screen overflow-y-auto z-10 border-r border-gray-900/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] no-scrollbar relative">
        {/* Sticky Top Logo */}
        <div className="sticky top-0 bg-[#08080a] z-20 pt-8 pb-4 w-full max-w-[400px] flex items-center justify-between shrink-0">
          <div className="relative h-10 w-40">
            <Image
              src="/assets/images/logo.png"
              alt="Alpha10 Banking Logo"
              fill
              priority
              className="object-contain object-left"
            />
          </div>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-[400px] my-auto py-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="w-full max-w-[400px] py-6 border-t border-gray-900/60 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span suppressHydrationWarning>&copy; {new Date().getFullYear()} Alpha10 Core Banking.</span>
        </div>
      </div>

      {/* Right Hero Graphic Section (Fixed, non-scrolling) */}
      <div className="w-[60%] bg-gradient-to-br from-[#1a0000] via-[#2a0305] to-[#4d0000] hidden md:flex justify-center items-center relative h-screen overflow-hidden shrink-0">
        <Image
          src="/assets/images/login-image.png"
          alt="Alpha10 Hero Platform"
          fill
          priority
          className="object-cover filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.7)]"
        />
      </div>
    </div>
  );
}
