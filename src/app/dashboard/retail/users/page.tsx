'use client';

import React, { useState } from 'react';
import { Users, Search, Filter, Plus, MoreHorizontal, TrendingUp, UserCheck, UserX } from 'lucide-react';

const users = [
  { id: 1, name: 'David Lee', email: 'david.lee@email.com', phone: '+234 801 234 5678', kyc: 'Approved', balance: '₦ 450,200', joined: 'Today', status: 'Active' },
  { id: 2, name: 'Maria Garcia', email: 'maria.g@email.com', phone: '+234 802 345 6789', kyc: 'Pending', balance: '₦ 120,000', joined: 'Today', status: 'Active' },
  { id: 3, name: 'James Smith', email: 'james.smith@email.com', phone: '+234 803 456 7890', kyc: 'Approved', balance: '₦ 2,100,000', joined: 'Yesterday', status: 'Active' },
  { id: 4, name: 'Anita Patel', email: 'anita.p@email.com', phone: '+234 804 567 8901', kyc: 'Rejected', balance: '₦ 0', joined: 'Yesterday', status: 'Suspended' },
  { id: 5, name: 'Michael Chen', email: 'michael.c@email.com', phone: '+234 805 678 9012', kyc: 'Pending', balance: '₦ 88,500', joined: '01 May 2025', status: 'Active' },
  { id: 6, name: 'Sarah Connor', email: 'sarah.c@email.com', phone: '+234 806 789 0123', kyc: 'Approved', balance: '₦ 750,000', joined: '28 Apr 2025', status: 'Active' },
];

const kycStyles: Record<string, string> = { Approved: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400', Pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400', Rejected: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' };
const statusStyles: Record<string, string> = { Active: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400', Suspended: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' };

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: 'blue' | 'green' | 'red' }) {
  const colors = { blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400', red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function RetailUsersPage() {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Retail Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage individual retail account holders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg text-sm transition shadow-sm">
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={String(users.length)} icon={<Users size={18} />} color="blue" />
        <StatCard label="KYC Approved" value={String(users.filter(u => u.kyc === 'Approved').length)} icon={<UserCheck size={18} />} color="green" />
        <StatCard label="Suspended" value={String(users.filter(u => u.status === 'Suspended').length)} icon={<UserX size={18} />} color="red" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition w-fit">
            <Filter size={16} /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Balance</th>
                <th className="px-6 py-3 font-medium">KYC</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#961A1C] to-[#4d0000] flex items-center justify-center text-white text-xs font-bold shrink-0">{user.name[0]}</div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{user.phone}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{user.balance}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-bold rounded-md ${kycStyles[user.kyc]}`}>{user.kyc}</span></td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusStyles[user.status]}`}>{user.status}</span></td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{user.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"><MoreHorizontal size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
