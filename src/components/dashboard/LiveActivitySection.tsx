'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  ChevronRight,
  ArrowUpRight,
  UserCheck,
  Building2,
  Filter,
  Lock,
} from 'lucide-react';

export type ActivityCategory = 'All' | 'Transfers' | 'Investments' | 'Approvals' | 'Security';

export interface ActivityFeedItem {
  id: string;
  event: string;
  details: string;
  actor: string;
  time: string;
  category: 'Transfers' | 'Investments' | 'Approvals' | 'Security';
  status: 'Completed' | 'Pending' | 'Failed' | 'Security';
  statusTag: string;
}

const ACTIVITIES: ActivityFeedItem[] = [
  {
    id: 'act-1',
    event: 'Transfer Completed',
    details: '₦2,500,000 → Corporate Reserve Wallet',
    actor: 'Sarah Connor',
    time: '2 mins ago',
    category: 'Transfers',
    status: 'Completed',
    statusTag: 'COMPLETED',
  },
  {
    id: 'act-2',
    event: 'KYC Approved',
    details: 'ABC Ltd · Corporate Tier 3 Business Verification',
    actor: 'Compliance Admin',
    time: '15 mins ago',
    category: 'Approvals',
    status: 'Completed',
    statusTag: 'APPROVED',
  },
  {
    id: 'act-3',
    event: 'Investment Created',
    details: '₦20,000,000 · High Yield Institutional Portfolio',
    actor: 'John Doe',
    time: '1 hour ago',
    category: 'Investments',
    status: 'Completed',
    statusTag: 'CREATED',
  },
  {
    id: 'act-4',
    event: 'Transfer Failed',
    details: '₦50,000,000 → Outbound NIBSS Wire (Insufficient Funds)',
    actor: 'System Engine',
    time: '2 hours ago',
    category: 'Transfers',
    status: 'Failed',
    statusTag: 'FAILED',
  },
  {
    id: 'act-5',
    event: 'Security Alert',
    details: 'Unusual IP Login detected from new location (197.210.xx.xx)',
    actor: 'Security Daemon',
    time: '3 hours ago',
    category: 'Security',
    status: 'Security',
    statusTag: 'ALERT',
  },
  {
    id: 'act-6',
    event: 'Loan Application Under Review',
    details: '₦15,000,000 Commercial Line requested by TechCorp NG',
    actor: 'Credit Desk',
    time: '4 hours ago',
    category: 'Approvals',
    status: 'Pending',
    statusTag: 'UNDER REVIEW',
  },
];

export default function LiveActivitySection() {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>('All');

  const filteredActivities = ACTIVITIES.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col h-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-gray-100 dark:border-gray-700/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Live Activity</h3>
            {/* Live Indicator */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time platform operations and financial events
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link
            href="/dashboard/activity-logs"
            className="text-xs font-semibold text-[#961A1C] dark:text-red-400 hover:underline flex items-center gap-0.5 shrink-0"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Category Filter Controls */}
      <div className="flex items-center gap-1.5 py-3 border-b border-gray-100 dark:border-gray-700/40 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Filter size={13} className="text-gray-400 shrink-0 mr-1" />
        {(['All', 'Transfers', 'Investments', 'Approvals', 'Security'] as ActivityCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline Feed Container */}
      <div className="flex-1 overflow-y-auto pt-4 pr-1 max-h-[380px] space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            No activity found for this category.
          </div>
        ) : (
          <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-700/70">
            {filteredActivities.map((act) => {
              return (
                <div key={act.id} className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-5 top-0.5 translate-x-[-2px]">
                    {act.status === 'Completed' && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 size={12} strokeWidth={2.5} />
                      </span>
                    )}
                    {act.status === 'Pending' && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Clock size={12} strokeWidth={2.5} />
                      </span>
                    )}
                    {act.status === 'Failed' && (
                      <span className="w-5 h-5 rounded-full bg-[#961A1C] text-white flex items-center justify-center shadow-xs">
                        <XCircle size={12} strokeWidth={2.5} />
                      </span>
                    )}
                    {act.status === 'Security' && (
                      <span className="w-5 h-5 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shadow-xs">
                        <ShieldAlert size={12} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>

                  {/* Activity Item Card */}
                  <div className="p-3 rounded-lg bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 hover:bg-gray-100/60 dark:hover:bg-gray-900/80 transition duration-150">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                        {act.event}
                      </h4>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded tracking-wider ${
                          act.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40'
                            : act.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
                            : act.status === 'Failed'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200/60 dark:border-red-900/40'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {act.statusTag}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1 font-mono">
                      {act.details}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 mt-2 pt-1.5 border-t border-gray-200/40 dark:border-gray-700/30">
                      <span>{act.actor}</span>
                      <span className="font-medium">{act.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
