'use client';

import React from 'react';
import Link from 'next/link';
import {
  UserCheck,
  Building2,
  Users,
  ShieldAlert,
  TrendingUp,
  ArrowLeftRight,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: React.ReactNode;
  bgColor: string;
  href: string;
}

const ACTIONS: ActionItem[] = [
  {
    id: 'action-kyc',
    title: 'Approve KYC',
    subtitle: 'Review pending corporate & retail verifications',
    badge: '12 Urgent',
    icon: <UserCheck size={22} strokeWidth={2.2} />,
    bgColor: 'bg-[#961A1C] hover:bg-[#7D1416]',
    href: '/dashboard/pending',
  },
  {
    id: 'action-companies',
    title: 'View Companies',
    subtitle: 'Corporate accounts & business entities',
    icon: <Building2 size={22} strokeWidth={2} />,
    bgColor: 'bg-[#101828] hover:bg-[#1E293B]',
    href: '/dashboard/corporate/organizations',
  },
  {
    id: 'action-users',
    title: 'Manage Users',
    subtitle: '1,245 registered retail customers',
    icon: <Users size={22} strokeWidth={2} />,
    bgColor: 'bg-[#064E3B] hover:bg-[#043E2F]',
    href: '/dashboard/retail/customers',
  },
  {
    id: 'action-alerts',
    title: 'Security Alerts',
    subtitle: '3 high risk flags requiring audit',
    badge: '3 Flags',
    icon: <ShieldAlert size={22} strokeWidth={2} />,
    bgColor: 'bg-[#1E293B] hover:bg-[#0F172A]',
    href: '/dashboard/compliance',
  },
  {
    id: 'action-investments',
    title: 'Review Investments',
    subtitle: 'High yield & institutional products',
    icon: <TrendingUp size={22} strokeWidth={2} />,
    bgColor: 'bg-[#4C0519] hover:bg-[#380312]',
    href: '/dashboard/corporate/investments',
  },
  {
    id: 'action-transactions',
    title: 'Review Transactions',
    subtitle: 'Audit logs & settlement queues',
    icon: <ArrowLeftRight size={22} strokeWidth={2} />,
    bgColor: 'bg-[#0F4C5C] hover:bg-[#0B3A46]',
    href: '/dashboard/transactions',
  },
];

export default function QuickActionsSection() {
  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Quick Actions</h3>
            <span className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
              <Zap size={13} fill="currentColor" />
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Common administrative tasks & operations
          </p>
        </div>
      </div>

      {/* Grid of Solid Action Cards directly on canvas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
        {ACTIONS.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={`p-5 rounded-xl text-white ${action.bgColor} shadow-xs transition-all duration-200 transform hover:-translate-y-0.5 flex flex-col justify-between group relative overflow-hidden`}
          >
            {/* Top Row: Icon + Badge / Hover Arrow */}
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="p-2.5 rounded-lg bg-white/10 backdrop-blur-xs text-white shrink-0 group-hover:bg-white/20 transition-colors">
                {action.icon}
              </div>

              {action.badge ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs border border-white/20">
                  {action.badge}
                </span>
              ) : (
                <div className="p-1 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <ArrowUpRight size={16} />
                </div>
              )}
            </div>

            {/* Bottom Section: Title & Subtitle */}
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                {action.title}
              </h4>
              <p className="text-[11px] text-white/80 mt-1 font-medium leading-normal">
                {action.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
