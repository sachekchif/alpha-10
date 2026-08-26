'use client';

import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
}: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of digits
  const otpArray = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Auto focus first input on mount or when reset to empty
    if (!value && inputsRef.current[0]) {
      inputsRef.current[0]?.focus();
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '');

    if (!digitsOnly) {
      // Digit was cleared/deleted
      const newOtp = [...otpArray];
      newOtp[index] = '';
      const combined = newOtp.join('');
      onChange(combined);
      return;
    }

    // Handle multiple digits entered (e.g. autofill or drag/drop)
    if (digitsOnly.length > 1) {
      const pastedDigits = digitsOnly.slice(0, length);
      const newOtp = [...otpArray];
      for (let i = 0; i < pastedDigits.length; i++) {
        if (index + i < length) {
          newOtp[index + i] = pastedDigits[i];
        }
      }
      const combined = newOtp.join('');
      onChange(combined);
      const nextFocusIndex = Math.min(index + pastedDigits.length, length - 1);
      inputsRef.current[nextFocusIndex]?.focus();
      if (combined.length === length && onComplete) {
        onComplete(combined);
      }
      return;
    }

    // Single digit entered
    const lastChar = digitsOnly;
    const newOtp = [...otpArray];
    newOtp[index] = lastChar;
    const combined = newOtp.join('');

    onChange(combined);

    // Auto focus next box if digit entered
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (combined.length === length && onComplete) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otpArray[index] && index > 0) {
        // Current box is empty, clear previous box digit and focus previous box
        const newOtp = [...otpArray];
        newOtp[index - 1] = '';
        const combined = newOtp.join('');
        onChange(combined);
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const targetIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[targetIndex]?.focus();

      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="flex justify-between items-center gap-2 sm:gap-3 my-6">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={otpArray[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          disabled={disabled}
          className={`w-12 h-14 sm:w-13 sm:h-15 text-center text-xl font-bold rounded-lg bg-[#24242a] text-white border transition-all duration-200 focus:outline-none ${
            hasError
              ? 'border-[#961A1C] ring-2 ring-[#961A1C]/30 text-red-400'
              : 'border-gray-700/80 focus:border-[#961A1C] focus:ring-[3px] focus:ring-[#961A1C]/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label={`Digit ${index + 1} of verification code`}
        />
      ))}
    </div>
  );
}

