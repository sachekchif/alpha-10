'use client';

import React, { useState } from 'react';
import { CreditCard, Search, Filter, Plus, Copy, MoreHorizontal, TrendingUp, Wallet } from 'lucide-react';

const accounts = [
  { id: 1, company: 'TechCorp Innovations Ltd', accountNumber: '0123456789', bank: 'Alpha10 Bank', balance: '₦ 18,200,000', type: 'Naira', status: 'Active', created: '14 Jan 2025' },
  { id: 2, company: 'TechCorp Innovations Ltd', accountNumber: '0123456790', bank: 'Alpha10 Bank', balance: '$ 12,400', type: 'USD', status: 'Active', created: '14 Jan 2025' },
  { id: 3, company: 'Globex Manufacturing', accountNumber: '0198765432', bank: 'Alpha10 Bank', balance: '₦ 12,800,000', type: 'Naira', status: 'Active', created: '05 Feb 2025' },
  { id: 4, company: 'Alpha Retail Group', accountNumber: '0112233445', bank: 'Alpha10 Bank', balance: '₦ 3,100,000', type: 'Naira', status: 'Suspended', created: '20 Feb 2025' },
  { id: 5, company: 'Nexus Capital Partners', accountNumber: '0155667788', bank: 'Alpha10 Bank', balance: '₦ 110,200,000', type: 'Naira', status: 'Active', created: '09 Apr 2025' },
];

const statusStyles: Record<string, string> = {
  Active: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
  Suspended: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
};

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: 'blue' | 'purple' | 'green' }) {
  const colors = { blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400', green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' };
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

export default function VirtualAccountsPage() {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const filtered = accounts.filter(a => a.company.toLowerCase().includes(search.toLowerCase()) || a.accountNumber.includes(search));

  const copyAccount = (num: string) => {
    navigator.clipboard.writeText(num).catch(() => {});
    setCopied(num);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Virtual Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all corporate virtual accounts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#961A1C] hover:bg-[#7a1517] text-white font-semibold rounded-lg text-sm transition shadow-sm">
          <Plus size={16} /> Create Account
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Accounts" value={String(accounts.length)} icon={<CreditCard size={18} />} color="blue" />
        <StatCard label="Active Accounts" value={String(accounts.filter(a => a.status === 'Active').length)} icon={<TrendingUp size={18} />} color="green" />
        <StatCard label="Total Balance" value="₦ 144.3M" icon={<Wallet size={18} />} color="purple" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company or account..." className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition w-fit">
            <Filter size={16} /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Account Number</th>
                <th className="px-6 py-3 font-medium">Currency</th>
                <th className="px-6 py-3 font-medium">Balance</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.map(account => (
                <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{account.company[0]}</div>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{account.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-700 dark:text-gray-300 text-sm">{account.accountNumber}</span>
                      <button onClick={() => copyAccount(account.accountNumber)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"><Copy size={13} /></button>
                      {copied === account.accountNumber && <span className="text-xs text-green-500">Copied!</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${account.type === 'USD' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{account.type}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{account.balance}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusStyles[account.status]}`}>{account.status}</span></td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{account.created}</td>
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
