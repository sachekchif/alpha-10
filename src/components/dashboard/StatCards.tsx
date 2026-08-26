import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  UserPlus, 
  Building2, 
  CreditCard 
} from 'lucide-react';

export default function StatCards({ role }: { role: string }) {
  // Mock Data
  const financialStats = [
    { title: "Total Wallet Balance", value: "4.2B", change: "+12.5%", isPositive: true, icon: Wallet, color: "bg-blue-500" },
    { title: "Total Inflow (Today)", value: "125.4M", change: "+4.2%", isPositive: true, icon: TrendingUp, color: "bg-emerald-500" },
    { title: "Total Outflow (Today)", value: "84.2M", change: "-2.1%", isPositive: false, icon: TrendingDown, color: "bg-rose-500" },
    { title: "Total Transactions", value: "14,029", change: "+8.4%", isPositive: true, icon: Activity, color: "bg-purple-500" },
  ];

  const userStats = [
    { title: "Total Users", value: "128.4K", change: "+1.2%", isPositive: true, icon: Users, color: "bg-indigo-500" },
    { title: "Active Users (Today)", value: "42.1K", change: "+5.4%", isPositive: true, icon: Activity, color: "bg-sky-500" },
    { title: "New Users (Today)", value: "842", change: "+12.0%", isPositive: true, icon: UserPlus, color: "bg-amber-500" },
    { title: "Corporate / Retail", value: "4K / 124K", change: "Steady", isPositive: true, icon: Building2, color: "bg-slate-700" },
  ];

  // Role based filtering logic
  const showFinancials = role === 'Super Admin' || role === 'Finance/Admin Ops';
  const showUsers = role === 'Super Admin' || role === 'Compliance Officer';

  return (
    <div className="flex flex-col gap-6">
      {showFinancials && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Financial Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-2 xl:grid-cols-4 gap-6">
            {financialStats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
        </div>
      )}

      {showUsers && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">User Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-2 xl:grid-cols-4 gap-6">
            {userStats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
          {/* Note: since bg-opacity-10 doesn't affect the exact text color cleanly via utility class inheritance here, we map the text color */}
          <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          change === "Steady" ? "bg-gray-100 text-gray-600" :
          isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        }`}>
          {change}
        </div>
      </div>
      <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
      <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
    </div>
  );
}
