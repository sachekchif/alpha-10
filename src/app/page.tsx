'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500); // Simulate network request
  };

  return (
    <div className="flex h-screen w-screen font-sans">
      {/* Left Form Section */}
      <div className="flex flex-col justify-center items-center bg-[#08080a] p-8 w-full md:w-[40%]">
        <div className="w-full max-w-[400px]">
          <div className="mb-12">
            <img src="/assets/images/logo.png" alt="Alpha10 Logo" className="h-12 w-auto object-contain" />
          </div>

          <h1 className="text-4xl leading-tight font-medium text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-300 mb-8">Enter the correct login details in the fields below</p>

          <form onSubmit={handleLogin}>
            <div className="mb-6 relative">
              <label className="block text-[0.85rem] font-semibold text-white mb-2" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-[0.8rem] bg-[#141417] text-white border border-gray-800 rounded-md text-base transition-colors duration-200 box-border focus:outline-none focus:border-[#961A1C] focus:ring-[3px] focus:ring-[#961A1C]/20 placeholder-gray-500"
                placeholder="superadmin@alpha10.com"
              />
            </div>

            <div className="mb-6 relative">
              <label className="block text-[0.85rem] font-semibold text-white mb-2" htmlFor="password">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full px-4 py-[0.8rem] bg-[#141417] text-white border border-gray-800 rounded-md text-base transition-colors duration-200 box-border focus:outline-none focus:border-[#961A1C] focus:ring-[3px] focus:ring-[#961A1C]/20 placeholder-gray-500"
                  placeholder="••••••••••••••••"
                />
                <div
                  className="absolute right-4 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8 text-[0.85rem]">
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input type="checkbox" className="w-4 h-4 cursor-pointer accent-[#961A1C]" />
                Keep me signed in
              </label>
              <a href="#" className="font-semibold text-[#961A1C] no-underline hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-[0.9rem] bg-[#961A1C] text-white border-none rounded-md text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#961A1C]/80 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Graphic Section */}
      <div className="w-[60%] bg-gradient-to-br from-[#1a0000] to-[#4d0000] hidden md:flex justify-center items-center relative overflow-hidden">
        <div className="relative flex justify-center items-center">
          <img src="/assets/images/login-image.png" alt="Alpha10 Hero" className="max-w-full max-h-full object-cover filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" />
        </div>
      </div>
    </div>
  );
}
