'use client';

import React from 'react';
import { Download, Search, Filter, Calendar, FileText, ChevronRight } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions Ledger</h1>
          <p className="text-gray-500 text-sm mt-1">Complete history of system inflows and outflows</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-sm transition">
            <FileText size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#961A1C] hover:bg-[#7a1517] rounded-lg shadow-sm transition">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
        
        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col xl:flex-row justify-between gap-4">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by User or Reference ID..."
              className="w-full bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 py-2.5 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#961A1C]"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last 30 Days</span>
            </div>
            
            {/* Type Filter */}
            <select className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#961A1C]">
              <option value="all">All Types</option>
              <option value="transfer">Transfer</option>
              <option value="funding">Funding</option>
              <option value="withdrawal">Withdrawal</option>
            </select>

            {/* Status Filter */}
            <select className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#961A1C]">
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Reference ID</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              <LedgerRow refId="TXN-98234-XQA" user="Alex Johnson" type="Transfer" amount="₦ 150,000" status="Success" date="29 Apr 2024, 10:45 AM" />
              <LedgerRow refId="TXN-12390-PLO" user="Maria Garcia" type="Funding" amount="₦ 50,000" status="Pending" date="29 Apr 2024, 09:12 AM" />
              <LedgerRow refId="TXN-55412-ZXC" user="Tech Innovators" type="Withdrawal" amount="₦ 2,000,000" status="Success" date="28 Apr 2024, 14:30 PM" />
              <LedgerRow refId="TXN-99812-BNM" user="James Smith" type="Transfer" amount="₦ 500,000" status="Failed" date="28 Apr 2024, 11:20 AM" />
              <LedgerRow refId="TXN-33411-VVB" user="Acme Logistics" type="Funding" amount="₦ 1,500,000" status="Success" date="27 Apr 2024, 16:15 PM" />
              <LedgerRow refId="TXN-11234-NMQ" user="Anita Patel" type="Withdrawal" amount="₦ 25,000" status="Success" date="27 Apr 2024, 08:30 AM" />
              <LedgerRow refId="TXN-77865-KKL" user="David Lee" type="Transfer" amount="₦ 10,000" status="Failed" date="26 Apr 2024, 13:45 PM" />
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500">
          <span>Showing 1 to 7 of 1,245 entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md bg-[#961A1C] text-white font-medium">1</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">2</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">3</button>
            <span className="px-2 py-1">...</span>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}

function LedgerRow({ refId, user, type, amount, status, date }: any) {
  const statusStyles: Record<string, string> = {
    Success: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    Pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    Failed: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer group">
      <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400 group-hover:text-[#961A1C] transition-colors">{refId}</td>
      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{user}</td>
      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{type}</td>
      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{amount}</td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusStyles[status]}`}>{status}</span>
      </td>
      <td className="px-6 py-4 text-gray-500 text-xs flex items-center justify-between">
        <span>{date}</span>
        <ChevronRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition" />
      </td>
    </tr>
  );
}
