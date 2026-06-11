'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, XOctagon, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AlertsPanel({ role }: { role: string }) {
  const alerts = [
    { id: 1, type: 'KYC', message: 'Pending KYC Approval for XYZ Ltd', timestamp: '10 mins ago', icon: Clock, bgColor: 'bg-amber-100', iconColor: 'text-amber-600', link: '/dashboard/compliance' },
    { id: 2, type: 'AML', message: 'Suspicious large transfer flagged (User #8492)', timestamp: '34 mins ago', icon: ShieldAlert, bgColor: 'bg-purple-100', iconColor: 'text-purple-600', link: '/dashboard/compliance' },
    { id: 3, type: 'Transaction', message: 'High-value transfer of ₦2.4M failed', timestamp: '1 hour ago', icon: XOctagon, bgColor: 'bg-rose-100', iconColor: 'text-rose-600', link: '/dashboard/transactions' },
    { id: 4, type: 'Loan', message: 'Corporate loan request pending (₦50M)', timestamp: '2 hours ago', icon: AlertTriangle, bgColor: 'bg-blue-100', iconColor: 'text-blue-600', link: '/dashboard/analytics' },
  ];

  // Role filtering
  const visibleAlerts = alerts.filter(alert => {
    if (role === 'Super Admin') return true;
    if (role === 'Compliance Officer') return ['KYC', 'AML'].includes(alert.type);
    if (role === 'Finance/Admin Ops') return ['Transaction', 'Loan'].includes(alert.type);
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-[#fffafa]">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
           <h3 className="font-bold text-gray-800 text-lg">Critical Alerts</h3>
        </div>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{visibleAlerts.length} Action(s) required</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {visibleAlerts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-medium text-sm">
            No critical alerts currently.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-50">
            {visibleAlerts.map((alert) => (
              <Link href={alert.link} key={alert.id} className="p-5 flex items-start gap-4 hover:bg-gray-50 transition cursor-pointer group">
                <div className={`p-2.5 rounded-full shrink-0 ${alert.bgColor}`}>
                  <alert.icon className={alert.iconColor} size={18} />
                </div>
                <div className="flex-1 pr-4">
                  <p className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-[#cc0000] transition">{alert.message}</p>
                  <p className="text-xs text-gray-400 font-medium">{alert.timestamp}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 shrink-0 self-center" />
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-100 text-center">
        <button className="text-sm font-semibold text-[#cc0000] hover:text-[#990000]">View all actionable items</button>
      </div>
    </div>
  );
}
