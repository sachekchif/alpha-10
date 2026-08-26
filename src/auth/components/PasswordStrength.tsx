'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const criteriaMet = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  let scoreLabel = 'Weak';
  let scoreColor = 'bg-red-500';
  let percent = 25;

  if (criteriaMet === 2) {
    scoreLabel = 'Fair';
    scoreColor = 'bg-orange-500';
    percent = 50;
  } else if (criteriaMet === 3) {
    scoreLabel = 'Good';
    scoreColor = 'bg-yellow-500';
    percent = 75;
  } else if (criteriaMet === 4) {
    scoreLabel = 'Strong';
    scoreColor = 'bg-emerald-500';
    percent = 100;
  }

  const requirements = [
    { label: 'At least 8 characters', met: hasMinLength },
    { label: 'At least one uppercase letter (A-Z)', met: hasUppercase },
    { label: 'At least one number (0-9)', met: hasNumber },
    { label: 'At least one special character (!@#$%^&*)', met: hasSpecial },
  ];

  return (
    <div className="mt-3 p-3.5 bg-[#101014] border border-gray-800/80 rounded-lg space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 font-medium">Password Strength:</span>
        <span
          className={`font-semibold ${
            criteriaMet <= 1
              ? 'text-red-400'
              : criteriaMet === 2
              ? 'text-orange-400'
              : criteriaMet === 3
              ? 'text-yellow-400'
              : 'text-emerald-400'
          }`}
        >
          {scoreLabel}
        </span>
      </div>

      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${scoreColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {requirements.map((req, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 transition-colors ${
              req.met ? 'text-emerald-400' : 'text-gray-500'
            }`}
          >
            {req.met ? (
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0 text-gray-600" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
