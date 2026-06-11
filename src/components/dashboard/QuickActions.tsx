'use client';

import React from 'react';
import { 
  PlusCircle, 
  UserCheck, 
  BarChart2, 
  Sliders 
} from 'lucide-react';

export default function QuickActions({ role }: { role: string }) {
  // Role based visualization logic
  const isCompliance = role === 'Compliance Officer';
  
  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {!isCompliance && (
          <>
            <ActionCard icon={PlusCircle} label="Create Investment Product" color="bg-[#1a1a2e]" hover="hover:bg-[#2a2a4e]" text="text-white" />
            <ActionCard icon={PlusCircle} label="Add Loan Product" color="bg-[#cc0000]" hover="hover:bg-[#ff3333]" text="text-white" />
          </>
        )}
        
        <ActionCard icon={UserCheck} label="View Pending KYC" color="bg-white border border-gray-200" hover="hover:border-blue-400 hover:text-blue-600 shadow-sm" text="text-gray-700" />
        <ActionCard icon={BarChart2} label="Generate Report" color="bg-white border border-gray-200" hover="hover:border-[#cc0000] hover:text-[#cc0000] shadow-sm" text="text-gray-700" />
        
        {!isCompliance && (
          <ActionCard icon={Sliders} label="Manage Rates" color="bg-white border border-gray-200" hover="hover:border-purple-400 hover:text-purple-600 shadow-sm" text="text-gray-700" />
        )}
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, label, color, hover, text }: any) {
  return (
    <button className={`w-full p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-200 ${color} ${hover} ${text} group disabled:opacity-50`}>
      <Icon size={24} className="group-hover:scale-110 transition-transform duration-200" />
      <span className="text-xs font-semibold text-center">{label}</span>
    </button>
  );
}
