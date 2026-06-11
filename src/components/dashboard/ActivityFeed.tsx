'use client';

import React from 'react';

export default function ActivityFeed({ role }: { role: string }) {
  const activities = [
    { id: 101, text: "User John Doe created an investment of ₦500,000", status: "success", time: "10:42 AM", category: "investment" },
    { id: 102, text: "KYC approved for XYZ Ltd", status: "success", time: "10:15 AM", category: "compliance" },
    { id: 103, text: "Transfer of ₦200,000 to Acc 093** failed", status: "failed", time: "09:55 AM", category: "transaction" },
    { id: 104, text: "Loan request submitted by Sarah Jenkins", status: "pending", time: "09:30 AM", category: "loan" },
    { id: 105, text: "Corporate Account registered: TechCorp NG", status: "success", time: "08:12 AM", category: "user" },
    { id: 106, text: "AML risk flag generated for transaction TR-99812", status: "pending", time: "Yesterday", category: "compliance" },
  ];

  const visibleActivities = activities.filter(activity => {
    if (role === 'Super Admin') return true;
    if (role === 'Compliance Officer') return ['compliance', 'user'].includes(activity.category);
    if (role === 'Finance/Admin Ops') return ['transaction', 'investment', 'loan'].includes(activity.category);
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-lg">System Activity Log</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="relative border-l border-gray-200 ml-3 space-y-6">
          {visibleActivities.map((act) => (
            <div key={act.id} className="relative pl-6">
              <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                act.status === 'success' ? 'bg-emerald-500' :
                act.status === 'failed' ? 'bg-rose-500' : 'bg-amber-500'
              }`}></span>
              <p className="text-sm font-medium text-gray-800 leading-snug">{act.text}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium select-none">{act.time}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100 text-center">
        <button className="text-sm font-semibold text-gray-500 hover:text-gray-800">Load more logs</button>
      </div>
    </div>
  );
}
