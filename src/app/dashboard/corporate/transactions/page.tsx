'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Filter, Download } from 'lucide-react';

const transactions = [
  { id: 'TXN-001', company: 'TechCorp Innovations', type: 'Transfer', amount: '₦ 5,200,000', direction: 'outflow', status: 'Success', date: 'Today, 10:45 AM' },
  { id: 'TXN-002', company: 'Nexus Capital Partners', type: 'Funding', amount: '₦ 20,000,000', direction: 'inflow', status: 'Success', date: 'Today, 09:12 AM' },
  { id: 'TXN-003', company: 'Globex Manufacturing', type: 'Withdrawal', amount: '₦ 1,800,000', direction: 'outflow', status: 'Pending', date: 'Yesterday, 14:30 PM' },
  { id: 'TXN-004', company: 'Alpha Retail Group', type: 'Transfer', amount: '₦ 900,000', direction: 'outflow', status: 'Failed', date: 'Yesterday, 11:20 AM' },
  { id: 'TXN-005', company: 'Omega Logistics', type: 'Funding', amount: '₦ 3,500,000', direction: 'inflow', status: 'Success', date: '01 May 2025' },
];

const statusStyles: Record<string, string> = {
  Success: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
  Pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
  Failed: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
};

export default function CorporateTransactionsPage() {
  const [search, setSearch] = useState('');
  const [dirFilter, setDirFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

  const filtered = transactions.filter(t => {
    const matchSearch = t.company.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchDir = dirFilter === 'all' || t.direction === dirFilter;
    return matchSearch && matchDir;
  });

  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Corporate Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">All transactions across corporate accounts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg text-sm transition shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{transactions.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><ArrowUpRight size={14} className="text-green-500" /> Total Inflow</p>
          <p className="text-2xl font-bold text-green-600">₦ 23.5M</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><ArrowDownRight size={14} className="text-red-500" /> Total Outflow</p>
          <p className="text-2xl font-bold text-red-600">₦ 7.9M</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company or transaction ID..." className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]" />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'inflow', 'outflow'] as const).map(f => (
              <button key={f} onClick={() => setDirFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${dirFilter === f ? 'bg-[#961A1C] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Transaction ID</th>
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Direction</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{t.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{t.company}</td>
                  <td className="px-6 py-4 text-gray-500">{t.type}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-xs font-bold w-fit px-2.5 py-1 rounded-md ${t.direction === 'inflow' ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {t.direction === 'inflow' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {t.direction}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{t.amount}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusStyles[t.status]}`}>{t.status}</span></td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
